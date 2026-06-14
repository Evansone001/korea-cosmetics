'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import ShipOrderModal from '@/components/admin/ShipOrderModal';
import {
  ShoppingCart, CheckCircle2, XCircle, Truck, Package,
  DollarSign, FileText, Search, Eye, Download, Printer,
  AlertCircle, Clock, TrendingUp, Bike, Copy, Phone, MapPin,
  Building2, User, Mail, Store, CheckCircle
} from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

const tw = createTw({});

// ─── Invoice PDF ─────────────────────────────────────────────────────────────
interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: { name: string; address: string; phone: string };
  items: WholesaleOrder['items'];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentInstructions: {
    bankName: string; accountName: string; accountNumber: string;
    swiftCode: string; reference: string;
  };
}

const InvoicePDF = ({ invoiceData }: { invoiceData: InvoiceData }) => (
  <Document>
    <Page size="A4" style={tw('p-12')}>
      <View style={tw('mb-8')}>
        <Text style={tw('text-4xl font-bold text-gray-900')}>INVOICE</Text>
        <Text style={tw('text-gray-600')}>{invoiceData.invoiceNumber}</Text>
      </View>
      <View style={tw('flex justify-between mb-8')}>
        <View>
          <Text style={tw('font-bold text-gray-700')}>Date:</Text>
          <Text style={tw('text-gray-900')}>{new Date(invoiceData.date).toLocaleDateString()}</Text>
          <Text style={tw('font-bold text-gray-700 mt-2')}>Due:</Text>
          <Text style={tw('text-gray-900')}>{new Date(invoiceData.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={tw('mb-8 p-4 bg-gray-100 rounded-lg')}>
        <Text style={tw('font-bold text-gray-700')}>Bill To:</Text>
        <Text style={tw('text-lg font-semibold text-gray-900 mt-2')}>{invoiceData.billTo.name}</Text>
        <Text style={tw('text-gray-600')}>{invoiceData.billTo.address}</Text>
        <Text style={tw('text-gray-600')}>{invoiceData.billTo.phone}</Text>
      </View>
      <View style={tw('mb-8')}>
        <Text style={tw('font-bold text-gray-700 mb-2')}>Items:</Text>
        {invoiceData.items.map((item, i) => (
          <View key={i} style={tw('flex justify-between py-2 border-b border-gray-200')}>
            <Text style={tw('text-gray-900 flex-1')}>{item.productName}</Text>
            <Text style={tw('text-gray-600 w-16 text-center')}>{item.quantity}</Text>
            <Text style={tw('text-gray-600 w-24 text-right')}>KES {item.unitPrice.toFixed(2)}</Text>
            <Text style={tw('text-gray-900 w-24 text-right font-semibold')}>KES {item.totalPrice.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={tw('mt-8 pt-4 border-t-2 border-gray-200')}>
        <Text style={tw('text-2xl font-bold text-right text-gray-900')}>Total: KES {invoiceData.total.toFixed(2)}</Text>
      </View>
      <View style={tw('mt-8 p-4 bg-gray-100 rounded-lg')}>
        <Text style={tw('font-bold text-gray-700')}>Payment Instructions:</Text>
        <Text style={tw('text-gray-900 mt-2')}>Bank: {invoiceData.paymentInstructions.bankName}</Text>
        <Text style={tw('text-gray-900')}>Account Name: {invoiceData.paymentInstructions.accountName}</Text>
        <Text style={tw('text-gray-900')}>Account Number: {invoiceData.paymentInstructions.accountNumber}</Text>
        <Text style={tw('text-gray-900')}>SWIFT Code: {invoiceData.paymentInstructions.swiftCode}</Text>
        <Text style={tw('text-gray-900')}>Reference: {invoiceData.paymentInstructions.reference}</Text>
      </View>
    </Page>
  </Document>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface WholesaleOrder {
  uuid: string;
  id: string;
  storeId: string;
  storeName: string;
  rejectionReason: string | null;
  rejectedAt: any;
  adminNotes: any;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: {
    addressLine1: string;
    addressLine2: any;
    state: any;
    postalCode: any;
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  riderCode?: string;
  riderPhone?: string;
  deliveryType?: string;
  estimatedDeliveryTime?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  shipped:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700 border-red-200' },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid:     { label: 'Paid',     color: 'text-green-700', bg: 'bg-green-50' },
  pending:  { label: 'Pending',  color: 'text-amber-700', bg: 'bg-amber-50' },
  refunded: { label: 'Refunded', color: 'text-gray-700',  bg: 'bg-gray-50' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipOrderData, setShipOrderData] = useState<{ orderId: string; orderNumber: string; storeName: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.request<any>('/api/admin/wholesale-orders');
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: string, uuid?: string) => {
    if (action === 'reject') {
      setRejectingOrderId(uuid || orderId);
      setShowRejectDialog(true);
      return;
    }
    setProcessingAction(`${uuid || orderId}-${action}`);
    try {
      const data = await apiClient.request<any>('/api/admin/wholesale-orders', {
        method: 'POST',
        body: JSON.stringify({ orderId: uuid || orderId, action }),
      });
      toast.success(data.message || `Order ${action}d`);
      if (action === 'approve' && data.invoice) {
        setInvoiceData(data.invoice);
        setShowInvoice(true);
      }
      fetchOrders();
    } catch {
      toast.error('Failed to process action');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrderId || !rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setProcessingAction(`${rejectingOrderId}-reject`);
    try {
      const data = await apiClient.request<any>('/api/admin/wholesale-orders', {
        method: 'POST',
        body: JSON.stringify({
          orderId: rejectingOrderId,
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
          ...(adminNotes.trim() && { adminNotes: adminNotes.trim() }),
        }),
      });
      toast.success(data.message || 'Order rejected');
      setShowRejectDialog(false);
      setRejectingOrderId(null);
      setRejectionReason('');
      setAdminNotes('');
      fetchOrders();
    } catch {
      toast.error('Failed to reject order');
    } finally {
      setProcessingAction(null);
    }
  };

  const openInvoice = (order: WholesaleOrder) => {
    const invoice: InvoiceData = {
      invoiceNumber: `INV-${order.id}`,
      date: order.createdAt,
      dueDate: new Date(new Date(order.createdAt).getTime() + 7 * 86400000).toISOString(),
      billTo: {
        name: order.shippingAddress.name,
        address: `${order.shippingAddress.address || order.shippingAddress.addressLine1 || ''}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`,
        phone: order.shippingAddress.phone,
      },
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      paymentInstructions: {
        bankName: 'Equity Bank Kenya',
        accountName: "KoreaCosmetics' Wholesale Ltd",
        accountNumber: '1234567890',
        swiftCode: 'EQBLKENA',
        reference: `INV-${order.id}`,
      },
    };
    setInvoiceData(invoice);
    setShowOrderDetails(false);
    setShowInvoice(true);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      o.storeName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.shippingAddress?.name || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((s, o) =>
    (o.status === 'confirmed' || o.status === 'delivered') && o.paymentStatus === 'paid' ? s + o.total : s, 0);
  const paidRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;
  const pendingPayment = orders.filter(o => o.paymentStatus === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesale Orders</h1>
          <p className="text-slate-500 mt-1">Manage reseller warehouse purchase orders</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertCircle className="text-amber-600" size={18} />
              <span className="text-amber-700 font-medium">{pendingCount} pending</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-slate-500">Confirmed Revenue</p>
            <p className="text-xl font-bold text-slate-900">KES {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Status stat tiles */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
          const count = orders.filter(o => o.status === status).length;
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-3 rounded-xl border text-left transition-all ${
                statusFilter === status ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <p className="text-xs text-slate-500 capitalize">{cfg.label}</p>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Total Orders</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">B2B Revenue</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">KES {paidRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">KES {Math.round(avgOrderValue).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Pending Payment</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{pendingPayment}</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by store name, order ID or contact..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-pink-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Order</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Store / Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Items</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Total</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Payment</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 sticky right-0 bg-gradient-to-r from-pink-50 to-rose-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {filteredOrders.map(order => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const paymentCfg = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.pending;
                const displayId = order.id?.match(/^WH-\d{4}-\d{5}$/) ? order.id : (order.id || '').slice(0, 8).toUpperCase();
                return (
                  <tr key={order.uuid || order.id} className="hover:bg-pink-50/30 cursor-pointer" onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-900">{displayId}</p>
                      <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{order.storeName}</p>
                          <p className="text-xs text-slate-500">{order.shippingAddress?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        {order.items.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-sm text-slate-600">{item.quantity}× {item.productName}</p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-slate-400">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap font-medium text-slate-900">
                      KES {order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${paymentCfg.bg} ${paymentCfg.color}`}>
                        {paymentCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white/80 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(order.id, 'approve', order.uuid)}
                              disabled={processingAction === `${order.uuid || order.id}-approve`}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleAction(order.id, 'reject', order.uuid)}
                              disabled={processingAction === `${order.uuid || order.id}-reject`}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}

                        {(order.status === 'confirmed' || order.status === 'processing') && (
                          <>
                            <button
                              onClick={() => {
                                setShipOrderData({ orderId: order.uuid || order.id, orderNumber: order.id, storeName: order.storeName });
                                setShowShipModal(true);
                              }}
                              disabled={processingAction === `${order.id}-ship`}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 disabled:opacity-50"
                            >
                              <Truck size={13} /> Ship
                            </button>
                            <button
                              onClick={() => handleAction(order.id, 'reject', order.uuid)}
                              disabled={processingAction === `${order.uuid || order.id}-reject`}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                              title="Reject Order"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleAction(order.id, 'deliver', order.uuid)}
                            disabled={processingAction === `${order.uuid || order.id}-deliver`}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            <Package size={13} /> Delivered
                          </button>
                        )}

                        {(order.status === 'confirmed' || order.status === 'processing') && order.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handleAction(order.id, 'mark-paid', order.uuid)}
                            disabled={processingAction === `${order.uuid || order.id}-mark-paid`}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                          >
                            <DollarSign size={13} /> Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500">
              {statusFilter || searchQuery ? 'Try adjusting your filters' : 'No wholesale purchase orders yet'}
            </p>
          </div>
        )}
      </div>

      {/* ── Order Details Modal ─────────────────────────────────────────────── */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedOrder.id}</h2>
                  <p className="text-slate-500 text-sm">Wholesale Order · {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setShowOrderDetails(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                  {STATUS_CONFIG[selectedOrder.status]?.label}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${PAYMENT_CONFIG[selectedOrder.paymentStatus]?.bg} ${PAYMENT_CONFIG[selectedOrder.paymentStatus]?.color}`}>
                  Payment: {PAYMENT_CONFIG[selectedOrder.paymentStatus]?.label}
                </span>
                {selectedOrder.deliveredAt && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-50 text-green-700">
                    <CheckCircle size={14} /> Delivered {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                  </span>
                )}
                {selectedOrder.shippedAt && !selectedOrder.deliveredAt && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-purple-50 text-purple-700">
                    <Truck size={14} /> Shipped {new Date(selectedOrder.shippedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Store & Shipping grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" /> Store Information
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{selectedOrder.storeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-700">Contact: {selectedOrder.shippingAddress?.name}</span>
                    </div>
                    {selectedOrder.shippingAddress?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <a href={`tel:${selectedOrder.shippingAddress.phone}`} className="text-blue-600 hover:underline">
                          {selectedOrder.shippingAddress.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500" /> Delivery Address
                  </h4>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p className="font-medium">{selectedOrder.shippingAddress?.name}</p>
                    <p>{selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.address}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p>
                      {[selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.state, selectedOrder.shippingAddress?.postalCode]
                        .filter(Boolean).join(', ')}
                    </p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Items table */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Order Items
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 font-medium text-slate-700">Product</th>
                      <th className="text-center py-2 font-medium text-slate-700">Qty</th>
                      <th className="text-right py-2 font-medium text-slate-700">Unit Price</th>
                      <th className="text-right py-2 font-medium text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-2">{item.productName}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">KES {item.unitPrice.toFixed(2)}</td>
                        <td className="text-right py-2 font-medium">KES {item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals + payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" /> Payment Details
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span>KES {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Discount</span>
                        <span className="text-green-600">-KES {selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax (16%)</span>
                      <span>KES {selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-base">
                      <span>Total</span>
                      <span>KES {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Timeline
                  </h4>
                  <div className="space-y-1.5 text-sm text-slate-700">
                    <p><span className="text-slate-500">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><span className="text-slate-500">Updated:</span> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                    {selectedOrder.shippedAt && (
                      <p><span className="text-slate-500">Shipped:</span> {new Date(selectedOrder.shippedAt).toLocaleString()}</p>
                    )}
                    {selectedOrder.deliveredAt && (
                      <p><span className="text-slate-500">Delivered:</span> {new Date(selectedOrder.deliveredAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection info */}
              {selectedOrder.status === 'cancelled' && selectedOrder.rejectionReason && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Rejection Information
                  </h4>
                  <p className="text-sm text-red-800"><span className="font-medium">Reason:</span> {selectedOrder.rejectionReason}</p>
                  {selectedOrder.rejectedAt && (
                    <p className="text-sm text-red-700 mt-1">Rejected: {new Date(selectedOrder.rejectedAt).toLocaleString()}</p>
                  )}
                  {selectedOrder.adminNotes && (
                    <p className="text-sm text-red-700 mt-1"><span className="font-medium">Admin notes:</span> {selectedOrder.adminNotes}</p>
                  )}
                </div>
              )}

              {/* Shipping info */}
              {selectedOrder.trackingNumber && (
                <div className={`rounded-xl p-4 border ${selectedOrder.shippingCarrier === 'BODA' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold flex items-center gap-2 ${selectedOrder.shippingCarrier === 'BODA' ? 'text-orange-800' : 'text-blue-800'}`}>
                      {selectedOrder.shippingCarrier === 'BODA' ? <Bike className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      Shipping Information
                    </h4>
                    {selectedOrder.shippingCarrier && (
                      <span className={`text-xs px-2 py-0.5 rounded ${selectedOrder.shippingCarrier === 'BODA' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {selectedOrder.shippingCarrier === 'BODA' ? 'Boda Boda' :
                         selectedOrder.shippingCarrier === 'KEN' ? 'Kenya Courier' :
                         selectedOrder.shippingCarrier === 'DHL' ? 'DHL Express' :
                         selectedOrder.shippingCarrier}
                      </span>
                    )}
                  </div>

                  {selectedOrder.shippingCarrier === 'BODA' && selectedOrder.riderCode && (
                    <div className="bg-white rounded-lg p-3 border border-orange-100 mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-orange-800">🛵 Rider Assigned</span>
                        {selectedOrder.deliveryType && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                            {selectedOrder.deliveryType === 'same_day' ? 'Same Day' :
                             selectedOrder.deliveryType === 'express' ? 'Express' : 'Scheduled'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-orange-900">Code: {selectedOrder.riderCode}</p>
                      {selectedOrder.riderPhone && (
                        <a href={`tel:${selectedOrder.riderPhone}`} className="flex items-center gap-1 text-sm text-orange-700 hover:text-orange-800 mt-1">
                          <Phone className="w-3.5 h-3.5" /> {selectedOrder.riderPhone}
                        </a>
                      )}
                      {selectedOrder.estimatedDeliveryTime && (
                        <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Est. arrival: {new Date(selectedOrder.estimatedDeliveryTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-slate-200">
                    <code className="text-sm font-mono text-slate-700 flex-1 truncate">{selectedOrder.trackingNumber}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedOrder.trackingNumber!); toast.success('Copied'); }}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500"
                      title="Copy tracking number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Modal action buttons */}
              <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="flex gap-2 flex-wrap">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => { handleAction(selectedOrder.id, 'approve', selectedOrder.uuid); setShowOrderDetails(false); }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Approve Order
                    </button>
                  )}
                  {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={() => {
                        setShipOrderData({ orderId: selectedOrder.uuid || selectedOrder.id, orderNumber: selectedOrder.id, storeName: selectedOrder.storeName });
                        setShowOrderDetails(false);
                        setShowShipModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => { handleAction(selectedOrder.id, 'deliver', selectedOrder.uuid); setShowOrderDetails(false); }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={() => { setShowOrderDetails(false); handleAction(selectedOrder.id, 'reject', selectedOrder.uuid); }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    >
                      Reject Order
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'delivered') && (
                    <button
                      onClick={() => openInvoice(selectedOrder)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm"
                    >
                      <FileText size={16} /> Invoice
                    </button>
                  )}
                  <button onClick={() => setShowOrderDetails(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Modal ───────────────────────────────────────────────────── */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8" id="invoice" ref={invoiceRef}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                  <p className="text-slate-500">{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>Date: {new Date(invoiceData.date).toLocaleDateString()}</p>
                  <p>Due: {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mb-8 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-slate-700 mb-2">Bill To:</h3>
                <p className="font-medium text-slate-900">{invoiceData.billTo.name}</p>
                <p className="text-slate-600">{invoiceData.billTo.address}</p>
                <p className="text-slate-600">{invoiceData.billTo.phone}</p>
              </div>
              <table className="w-full mb-8 text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 font-medium text-slate-700">Item</th>
                    <th className="text-center py-2 font-medium text-slate-700">Qty</th>
                    <th className="text-right py-2 font-medium text-slate-700">Unit Price</th>
                    <th className="text-right py-2 font-medium text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2">{item.productName}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">KES {item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-2">KES {item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal:</span><span>KES {invoiceData.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Discount:</span><span className="text-green-600">-KES {invoiceData.discount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tax:</span><span>KES {invoiceData.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total Due:</span><span>KES {invoiceData.total.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-sm">
                <h3 className="font-medium text-slate-700 mb-2">Payment Instructions</h3>
                <p><span className="text-slate-500">Bank:</span> {invoiceData.paymentInstructions.bankName}</p>
                <p><span className="text-slate-500">Account:</span> {invoiceData.paymentInstructions.accountName}</p>
                <p><span className="text-slate-500">Account No:</span> {invoiceData.paymentInstructions.accountNumber}</p>
                <p><span className="text-slate-500">SWIFT:</span> {invoiceData.paymentInstructions.swiftCode}</p>
                <p><span className="text-slate-500">Ref:</span> <strong>{invoiceData.paymentInstructions.reference}</strong></p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowInvoice(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm">Close</button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                <Printer size={16} /> Print
              </button>
              {invoiceData && (
                <PDFDownloadLink
                  document={<InvoicePDF invoiceData={invoiceData} />}
                  fileName={`invoice-${invoiceData.invoiceNumber}.pdf`}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm"
                >
                  {({ loading }) => <><Download size={16} />{loading ? 'Generating...' : 'Download PDF'}</>}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Ship Order Modal ────────────────────────────────────────────────── */}
      {showShipModal && shipOrderData && (
        <ShipOrderModal
          isOpen={showShipModal}
          onClose={() => { setShowShipModal(false); setShipOrderData(null); }}
          orderId={shipOrderData.orderId}
          orderNumber={shipOrderData.orderNumber}
          storeName={shipOrderData.storeName}
          onShipped={() => fetchOrders()}
        />
      )}

      {/* ── Rejection Dialog ────────────────────────────────────────────────── */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Reject Order</h2>
              <button onClick={() => setShowRejectDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Please explain why this order is being rejected..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional notes for internal records..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setShowRejectDialog(false); setRejectingOrderId(null); setRejectionReason(''); setAdminNotes(''); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                  disabled={processingAction === `${rejectingOrderId}-reject`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectOrder}
                  disabled={!rejectionReason.trim() || processingAction === `${rejectingOrderId}-reject`}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {processingAction === `${rejectingOrderId}-reject` ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Rejecting...</>
                  ) : 'Reject Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
