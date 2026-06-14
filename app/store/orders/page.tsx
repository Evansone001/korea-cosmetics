'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  X,
  Copy,
  ExternalLink,
  Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Status transition rules matching backend OrderStateMachine
const STATUS_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],  // Terminal state
  cancelled: [],  // Terminal state
  refunded: []    // Terminal state
};

const getValidTransitions = (currentStatus: Order['status']): Order['status'][] => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipChannel, setShipChannel] = useState<'own_driver' | 'courier'>('own_driver');
  const [shipTrackingNumber, setShipTrackingNumber] = useState('');
  const [shipCarrierName, setShipCarrierName] = useState('');
  const [driverLink, setDriverLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'customer' | 'wholesale'>('customer');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 50;
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    setOffset(0);
    fetchOrders(0, false);
    fetchStats();
  }, [statusFilter, activeTab]);

  // Polling for real-time updates (first page only)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(0, false);
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [statusFilter, activeTab]);

  // FIXED: Handles both customer and wholesale order structures
  const fetchOrders = async (pageOffset: number, append: boolean = false) => {
    try {
      if (append) setIsLoadingMore(true);
      else setLoading(true);

      const response = activeTab === 'customer'
        ? await apiClient.getStoreOrders({ status: statusFilter || undefined, limit: LIMIT, offset: pageOffset })
        : await apiClient.getWholesaleOrders({ status: statusFilter || undefined, limit: LIMIT, offset: pageOffset });

      const transformedOrders: Order[] = (response?.orders || []).map((order: any) => {
        // Handle different field names (wholesale vs customer)
        const orderTotal = order.total_amount ?? order.total ?? 0;
        const orderStatus = order.status ?? 'pending';
        const orderCreatedAt = order.created_at ?? order.createdAt ?? new Date().toISOString();
        const orderUpdatedAt = order.updated_at ?? order.updatedAt ?? orderCreatedAt;

        const items: OrderItem[] = (order.items || []).map((item: any) => ({
          productId: item.product_id ?? item.productId,
          productName: item.product_name ?? item.productName ?? 'Unknown Product',
          quantity: item.quantity ?? 0,
          unitPrice: item.unit_price ?? item.unitPrice ?? item.price ?? 0,
          total: item.total ?? item.line_total ?? (item.quantity * (item.unit_price ?? item.price ?? 0)),
        }));

        // Build shipping address with proper defaults
        const rawAddress = order.shipping_address || order.shippingAddress || {
          street: order.address_line1 || '',
          city: order.city || '',
          state: order.state || '',
          zipCode: order.postal_code || order.zipCode || '',
          country: order.country || ''
        };

        const shippingAddress = {
          street: rawAddress.street || '',
          city: rawAddress.city || '',
          state: rawAddress.state || '',
          zipCode: rawAddress.zipCode || '',
          country: rawAddress.country || ''
        };

        // Customer name fallback for wholesale orders
        const customerName = order.customer?.name || order.storeName || 'Wholesale Purchase';

        return {
          id: order.id,
          customerName,
          customerEmail: order.customer?.email || '',
          customerPhone: order.customer?.phone || '',
          shippingAddress,
          items,
          subtotal: orderTotal,
          shipping: order.shipping ?? 0,
          tax: order.tax ?? 0,
          total: orderTotal,
          status: orderStatus,
          paymentStatus: (order.is_paid ? 'paid' : 'pending') as 'paid' | 'pending', // explicit cast
          notes: order.notes,
          createdAt: orderCreatedAt,
          updatedAt: orderUpdatedAt,
        };
      });

      if (append) {
        setOrders(prev => [...prev, ...transformedOrders]);
      } else {
        setOrders(transformedOrders);
      }
      setHasMore(response?.pagination?.has_more ?? false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // FIXED: Handles both customer and wholesale stats
  const fetchStats = async () => {
    try {
      const response = activeTab === 'customer'
        ? await apiClient.getOrderStats(30)
        : await apiClient.getWholesaleOrderStats(30);

      if (activeTab === 'customer') {
        const orderStats = response?.statistics || {};
        setStats({
          totalOrders: orderStats.total_orders || 0,
          totalRevenue: orderStats.total_revenue || 0,
          pending: response?.status_breakdown?.order_placed || 0,
          processing: response?.status_breakdown?.processing || 0,
          shipped: response?.status_breakdown?.shipped || 0,
          delivered: response?.status_breakdown?.delivered || 0
        });
      } else {
        // Wholesale stats – adjust for possible different field names
        const wholesaleStats = response?.statistics || response || {};
        setStats({
          totalOrders: wholesaleStats.total_orders || wholesaleStats.totalOrders || 0,
          totalRevenue: wholesaleStats.total_revenue || wholesaleStats.totalRevenue || 0,
          pending: wholesaleStats.pending || response?.status_breakdown?.pending || 0,
          processing: wholesaleStats.processing || response?.status_breakdown?.processing || 0,
          shipped: wholesaleStats.shipped || response?.status_breakdown?.shipped || 0,
          delivered: wholesaleStats.delivered || response?.status_breakdown?.delivered || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={14} />,
      confirmed: <CheckCircle2 size={14} />,
      processing: <Package size={14} />,
      shipped: <Truck size={14} />,
      delivered: <CheckCircle2 size={14} />,
      cancelled: <XCircle size={14} />
    };
    return icons[status] || <MoreHorizontal size={14} />;
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!selectedOrder) return;
    if (activeTab === 'wholesale') return; // wholesale status is admin-controlled

    // 'shipped' transition requires shipping channel selection
    if (newStatus === 'shipped') {
      setShowUpdateModal(false);
      setShipChannel('own_driver');
      setShipTrackingNumber('');
      setShipCarrierName('');
      setDriverLink(null);
      setShowShipModal(true);
      return;
    }

    try {
      await apiClient.updateOrderStatus(selectedOrder.id, newStatus);

      setOrders(prev => prev.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));

      toast.success(`Order ${selectedOrder.id} status updated to ${newStatus}`);
      setShowUpdateModal(false);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      const errorMessage = error?.response?.data?.error || error?.message || error?.error || 'Failed to update order status';
      toast.error(errorMessage);
    }
  };

  const handleShipOrder = async () => {
    if (!selectedOrder) return;
    try {
      const res: any = await apiClient.shipOrder(selectedOrder.id, {
        shipping_channel: shipChannel,
        tracking_number: shipTrackingNumber.trim() || undefined,
        carrier_name: shipCarrierName.trim() || undefined,
      });
      setOrders(prev => prev.map(o =>
        o.id === selectedOrder.id ? { ...o, status: 'shipped', updatedAt: new Date().toISOString() } : o
      ));
      toast.success('Order shipped!');
      if (res?.driver_token) {
        const link = `${window.location.origin}/driver/${selectedOrder.id}?token=${res.driver_token}`;
        setDriverLink(link);
      } else {
        setShowShipModal(false);
        setSelectedOrder(null);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Failed to ship order';
      toast.error(msg);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-slate-500 mt-1">
          {activeTab === 'customer' ? 'Manage orders from your B2C customers' : 'Manage your wholesale purchases from warehouse'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'customer'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Customer Orders
        </button>
        <button
          onClick={() => setActiveTab('wholesale')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'wholesale'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Warehouse Purchases
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
              <p className="text-sm text-slate-500">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.processing}</p>
              <p className="text-sm text-slate-500">Processing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Truck className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.shipped}</p>
              <p className="text-sm text-slate-500">Shipped</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.delivered}</p>
              <p className="text-sm text-slate-500">Delivered</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                KES {stats.totalRevenue.toFixed(0)}
              </p>
              <p className="text-sm text-slate-500">{activeTab === 'customer' ? 'Revenue' : 'Cost'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-pink-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'customer' ? 'Search orders by ID, customer name, or email...' : 'Search orders by ID or product name...'}
              className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-pink-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-pink-100 shadow-sm hover:shadow-lg transition-all"
          >
            {/* Order Header */}
            <div
              className="p-5 cursor-pointer"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-pink-500" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {order.customerName} • {order.items.length} item{order.items.length > 1 ? 's' : ''} • KES {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="text-slate-400" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400" size={20} />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {expandedOrder === order.id && (
              <div className="border-t border-pink-100 p-5 space-y-5">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-50/50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      <User size={16} className="text-pink-500" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-900 font-medium">{order.customerName}</p>
                      <p className="text-slate-600">{order.customerEmail}</p>
                      <p className="text-slate-600 flex items-center gap-1">
                        <Phone size={14} />
                        {order.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-pink-50/50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-pink-500" />
                      Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-pink-50/30 rounded-xl p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                            <Package className="text-pink-500" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.productName}</p>
                            <p className="text-sm text-slate-500">Qty: {item.quantity} × KES {item.unitPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-medium text-slate-900">KES {item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex justify-end">
                  <div className="w-full md:w-72 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>KES {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>KES {order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span>KES {order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900 text-base pt-2 border-t border-pink-100">
                      <span>Total</span>
                      <span>KES {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {activeTab === 'customer' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowUpdateModal(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors text-sm font-medium"
                    >
                      Update Status
                    </button>
                  )}
                  {activeTab === 'wholesale' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <p className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                      Status updates for warehouse purchases are managed by the platform admin.
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex-1">
                      Note: {order.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {hasMore && !searchQuery && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                const nextOffset = offset + LIMIT;
                setOffset(nextOffset);
                fetchOrders(nextOffset, true);
              }}
              disabled={isLoadingMore}
              className="px-6 py-2.5 bg-white border border-pink-200 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500">
              {searchQuery || statusFilter
                ? 'Try adjusting your search or filters'
                : activeTab === 'customer' ? 'Orders from your B2C customers will appear here' : 'Your wholesale purchases will appear here'
              }
            </p>
          </div>
        )}
      </div>

      {/* Ship Order Modal */}
      {showShipModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Ship Order</h3>
            <p className="text-slate-500 text-sm mb-5">
              Choose how you are delivering <span className="font-medium">{selectedOrder.id}</span>
            </p>

            {!driverLink ? (
              <>
                {/* Channel selector */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => setShipChannel('own_driver')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      shipChannel === 'own_driver'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Navigation size={22} />
                    <span className="text-sm font-medium">Own Driver / Boda</span>
                    <span className="text-xs opacity-70">Live GPS pin</span>
                  </button>
                  <button
                    onClick={() => setShipChannel('courier')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      shipChannel === 'courier'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Truck size={22} />
                    <span className="text-sm font-medium">3rd-Party Courier</span>
                    <span className="text-xs opacity-70">Tracking number</span>
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tracking Number {shipChannel === 'courier' ? <span className="text-red-500">*</span> : <span className="text-slate-400">(optional)</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KEN123456789"
                      value={shipTrackingNumber}
                      onChange={e => setShipTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>
                  {shipChannel === 'courier' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Carrier Name (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. DHL, G4S, Sendy"
                        value={shipCarrierName}
                        onChange={e => setShipCarrierName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowShipModal(false); setSelectedOrder(null); }}
                    className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShipOrder}
                    disabled={shipChannel === 'courier' && !shipTrackingNumber.trim()}
                    className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Truck size={15} />
                    Mark as Shipped
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">✓ Order shipped! Send this link to the driver:</p>
                  <div className="flex items-center gap-2 bg-white border border-green-300 rounded-lg px-3 py-2 mb-3">
                    <span className="text-xs text-slate-600 flex-1 truncate">{driverLink}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(driverLink!); toast.success('Link copied!'); }}
                      className="p-1 hover:bg-green-100 rounded"
                      title="Copy"
                    >
                      <Copy size={14} className="text-green-700" />
                    </button>
                    <a href={driverLink} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-green-100 rounded">
                      <ExternalLink size={14} className="text-green-700" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Hi! Here is your delivery tracking link for order ${selectedOrder?.id}. Open this on your phone to share your live location with the customer: ${driverLink}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe5d] transition-colors text-sm font-medium"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                    <a
                      href={`sms:?body=${encodeURIComponent(`Delivery link for order ${selectedOrder?.id}: ${driverLink}`)}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      <Phone size={14} />
                      SMS
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(driverLink!); toast.success('Link copied!'); }}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">Driver opens the link on their phone to share live GPS location.</p>
                </div>
                <button
                  onClick={() => { setShowShipModal(false); setDriverLink(null); setSelectedOrder(null); }}
                  className="w-full py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Update <span className="font-semibold">Order Status</span>
            </h3>

            {/* Order Details */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Order ID:</span>
                  <span className="font-medium text-slate-900">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer:</span>
                  <span className="font-medium text-slate-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-900">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-medium text-slate-900">KES {selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Items:</span>
                  <span className="font-medium text-slate-900">{selectedOrder.items.length}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 mb-4">
              Current status: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {getValidTransitions(selectedOrder.status).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={status === selectedOrder.status}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    status === selectedOrder.status
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {getStatusIcon(status)}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}