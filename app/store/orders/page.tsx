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
  MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    // Mock data - store orders from B2C customers
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-2026-001',
          customerName: 'Jane Wanjiku',
          customerEmail: 'jane.w@email.com',
          customerPhone: '+254712345678',
          shippingAddress: {
            street: '123 Kimathi Street',
            city: 'Nairobi',
            state: 'Nairobi County',
            zipCode: '00100',
            country: 'Kenya'
          },
          items: [
            { productId: 'wp_1', productName: 'COSRX Snail Mucin Essence', quantity: 2, unitPrice: 28.00, total: 56.00 },
            { productId: 'wp_3', productName: 'Beauty of Joseon Glow Serum', quantity: 1, unitPrice: 22.00, total: 22.00 }
          ],
          subtotal: 78.00,
          shipping: 5.00,
          tax: 6.24,
          total: 89.24,
          status: 'pending',
          paymentStatus: 'paid',
          createdAt: '2026-04-04T10:30:00Z',
          updatedAt: '2026-04-04T10:30:00Z'
        },
        {
          id: 'ORD-2026-002',
          customerName: 'Michael Omondi',
          customerEmail: 'm.omondi@email.com',
          customerPhone: '+254723456789',
          shippingAddress: {
            street: '456 Moi Avenue',
            city: 'Mombasa',
            state: 'Mombasa County',
            zipCode: '80100',
            country: 'Kenya'
          },
          items: [
            { productId: 'wp_2', productName: 'Innisfree Green Tea Serum', quantity: 3, unitPrice: 35.00, total: 105.00 }
          ],
          subtotal: 105.00,
          shipping: 5.00,
          tax: 8.80,
          total: 118.80,
          status: 'processing',
          paymentStatus: 'paid',
          createdAt: '2026-04-03T14:20:00Z',
          updatedAt: '2026-04-04T09:15:00Z'
        },
        {
          id: 'ORD-2026-003',
          customerName: 'Sarah Kimani',
          customerEmail: 'sarah.k@email.com',
          customerPhone: '+254734567890',
          shippingAddress: {
            street: '789 Kenyatta Avenue',
            city: 'Kisumu',
            state: 'Kisumu County',
            zipCode: '40100',
            country: 'Kenya'
          },
          items: [
            { productId: 'wp_4', productName: 'LANEIGE Lip Sleeping Mask', quantity: 2, unitPrice: 24.00, total: 48.00 },
            { productId: 'wp_5', productName: 'Etude House Eyebrow Pencil', quantity: 1, unitPrice: 12.00, total: 12.00 }
          ],
          subtotal: 60.00,
          shipping: 5.00,
          tax: 5.20,
          total: 70.20,
          status: 'shipped',
          paymentStatus: 'paid',
          createdAt: '2026-04-02T16:45:00Z',
          updatedAt: '2026-04-03T11:30:00Z'
        },
        {
          id: 'ORD-2026-004',
          customerName: 'David Njoroge',
          customerEmail: 'david.n@email.com',
          customerPhone: '+254745678901',
          shippingAddress: {
            street: '321 Tom Mboya Street',
            city: 'Nakuru',
            state: 'Nakuru County',
            zipCode: '20100',
            country: 'Kenya'
          },
          items: [
            { productId: 'wp_1', productName: 'COSRX Snail Mucin Essence', quantity: 1, unitPrice: 28.00, total: 28.00 }
          ],
          subtotal: 28.00,
          shipping: 5.00,
          tax: 2.64,
          total: 35.64,
          status: 'delivered',
          paymentStatus: 'paid',
          createdAt: '2026-04-01T09:00:00Z',
          updatedAt: '2026-04-03T15:20:00Z'
        },
        {
          id: 'ORD-2026-005',
          customerName: 'Grace Muthoni',
          customerEmail: 'grace.m@email.com',
          customerPhone: '+254756789012',
          shippingAddress: {
            street: '654 Haile Selassie Avenue',
            city: 'Nairobi',
            state: 'Nairobi County',
            zipCode: '00100',
            country: 'Kenya'
          },
          items: [
            { productId: 'wp_3', productName: 'Beauty of Joseon Glow Serum', quantity: 2, unitPrice: 22.00, total: 44.00 },
            { productId: 'wp_4', productName: 'LANEIGE Lip Sleeping Mask', quantity: 1, unitPrice: 24.00, total: 24.00 }
          ],
          subtotal: 68.00,
          shipping: 5.00,
          tax: 5.84,
          total: 78.84,
          status: 'cancelled',
          paymentStatus: 'refunded',
          createdAt: '2026-03-30T11:15:00Z',
          updatedAt: '2026-04-01T10:00:00Z',
          notes: 'Customer requested cancellation'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

  const handleStatusUpdate = (newStatus: Order['status']) => {
    if (!selectedOrder) return;
    
    setOrders(prev => prev.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
    
    toast.success(`Order ${selectedOrder.id} status updated to ${newStatus}`);
    setShowUpdateModal(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)
  };

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
          Manage orders from your B2C customers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{orderStats.total}</p>
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
              <p className="text-2xl font-bold text-slate-900">{orderStats.pending}</p>
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
              <p className="text-2xl font-bold text-slate-900">{orderStats.processing}</p>
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
              <p className="text-2xl font-bold text-slate-900">{orderStats.shipped}</p>
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
              <p className="text-2xl font-bold text-slate-900">{orderStats.delivered}</p>
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
              <p className="text-2xl font-bold text-slate-900">${orderStats.revenue.toFixed(0)}</p>
              <p className="text-sm text-slate-500">Revenue</p>
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
              placeholder="Search orders by ID, customer name, or email..."
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
            className="bg-white rounded-xl border border-pink-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Order Header */}
            <div 
              className="p-4 cursor-pointer"
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
                      {order.customerName} • {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.total.toFixed(2)}
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
              <div className="border-t border-pink-100 p-4 space-y-4">
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
                            <p className="text-sm text-slate-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-medium text-slate-900">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex justify-end">
                  <div className="w-full md:w-72 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>${order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900 text-base pt-2 border-t border-pink-100">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
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
                : 'Orders from your B2C customers will appear here'
              }
            </p>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Update Order Status
            </h3>
            <p className="text-slate-600 mb-6">
              Current status: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={status === selectedOrder.status}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    status === selectedOrder.status
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-pink-200 text-slate-700 hover:bg-pink-50 hover:border-pink-300'
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
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
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
