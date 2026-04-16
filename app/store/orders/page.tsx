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
  X
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'wholesale'>('customer');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = activeTab === 'customer'
        ? await apiClient.getStoreOrders({
            status: statusFilter || undefined,
            limit: 50
          })
        : await apiClient.getWholesaleOrders({
            status: statusFilter || undefined,
            limit: 50
          });

      // Transform backend orders to frontend format
      const transformedOrders = response?.orders?.map((order: any) => ({
        id: order.id,
        customerName: order.customer?.name || 'Unknown',
        customerEmail: order.customer?.email || '',
        customerPhone: order.customer?.phone || '',
        shippingAddress: order.shipping_address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        items: order.items?.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.total
        })) || [],
        subtotal: order.total,
        shipping: 0,
        tax: 0,
        total: order.total,
        status: order.status,
        paymentStatus: order.is_paid ? ('paid' as const) : ('pending' as const),
        createdAt: order.created_at,
        updatedAt: order.updated_at
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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
          shipped: response.status_breakdown?.shipped || 0,
          delivered: response.status_breakdown?.delivered || 0
        });
      } else {
        const wholesaleStats = response.statistics || {};
        setStats({
          totalOrders: wholesaleStats.total_orders || 0,
          totalRevenue: wholesaleStats.total_revenue || 0,
          pending: response.status_breakdown?.order_placed || 0,
          processing: response.status_breakdown?.processing || 0,
          shipped: response.status_breakdown?.shipped || 0,
          delivered: response.status_breakdown?.delivered || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock size={14} />,
      processing: <Package size={14} />,
      shipped: <Truck size={14} />,
      delivered: <CheckCircle2 size={14} />,
      cancelled: <XCircle size={14} />
    };
    return icons[status] || <MoreHorizontal size={14} />;
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!selectedOrder) return;

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
      // Extract error message from backend response
      const errorMessage = error?.response?.data?.error || error?.message || error?.error || 'Failed to update order status';
      toast.error(errorMessage);
      // Keep modal open so user can see the error and try again
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
              <p className="text-2xl font-bold text-slate-900">{activeTab === 'customer' ? '$' : 'KES '}{stats.totalRevenue.toFixed(0)}</p>
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
                      {order.customerName} • {order.items.length} item{order.items.length > 1 ? 's' : ''} • {activeTab === 'customer' ? '$' : 'KES '}{order.total.toFixed(2)}
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
                            <p className="text-sm text-slate-500">Qty: {item.quantity} × {activeTab === 'customer' ? '$' : 'KES '}{item.unitPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-medium text-slate-900">{activeTab === 'customer' ? '$' : 'KES '}{item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex justify-end">
                  <div className="w-full md:w-72 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{activeTab === 'customer' ? '$' : 'KES '}{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>{activeTab === 'customer' ? '$' : 'KES '}{order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span>{activeTab === 'customer' ? '$' : 'KES '}{order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900 text-base pt-2 border-t border-pink-100">
                      <span>Total</span>
                      <span>{activeTab === 'customer' ? '$' : 'KES '}{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
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
                  <span className="font-medium text-slate-900">{activeTab === 'customer' ? '$' : 'KES '}{selectedOrder.total.toFixed(2)}</span>
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
