'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingCart, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Package,
  DollarSign,
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

const tw = createTw({});

// Invoice PDF Component
const InvoicePDF = ({ invoiceData }: { invoiceData: InvoiceData }) => {
  return (
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
          {invoiceData.items.map((item, index) => (
            <View key={index} style={tw('flex justify-between py-2 border-b border-gray-200')}>
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
};

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: {
    name: string;
    address: string;
    phone: string;
  };
  items: WholesaleOrder['items'];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentInstructions: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    reference: string;
  };
}

interface WholesaleOrder {
  id: string;
  storeId: string;
  storeName: string;
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
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: {
    name: string;
    address: string;
    phone: string;
  };
  items: WholesaleOrder['items'];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentInstructions: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    reference: string;
  };
}

export default function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadInvoice = () => {
    toast.success('Generating PDF...');
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.request<any>('/api/admin/wholesale-orders');
      console.log('API Response:', data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: string) => {
    setProcessingAction(`${orderId}-${action}`);
    
    try {
      const body: Record<string, string> = { orderId, action };
      if (action === 'ship' && trackingNumber) {
        body.trackingNumber = trackingNumber;
      }

      const data = await apiClient.request<any>('/api/admin/wholesale-orders', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      toast.success(data.message);
      
      if (action === 'approve' && data.invoice) {
        setInvoiceData(data.invoice);
        setShowInvoice(true);
      }
      
      fetchOrders();
      setTrackingNumber('');
    } catch (error) {
      toast.error('Failed to process action');
    } finally {
      setProcessingAction(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = 
      order.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => {
    const isApproved = o.status === 'confirmed' || o.status === 'delivered';
    const isPaid = o.paymentStatus === 'paid';
    return (isApproved && isPaid) ? sum + o.total : sum;
  }, 0);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesale Orders</h1>
          <p className="text-slate-500 mt-1">
            Manage reseller orders and inventory distribution
          </p>
        </div>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertCircle className="text-amber-600" size={18} />
              <span className="text-amber-700 font-medium">{pendingCount} pending orders</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-xl font-bold text-slate-900">KES {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-4 rounded-xl border text-left transition-all ${
                statusFilter === status 
                  ? 'border-slate-900 bg-slate-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm text-slate-500 capitalize">{status}</p>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-pink-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">Order</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">Store</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">Items</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">Total</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">Status</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">Payment</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap sticky right-0 bg-gradient-to-r from-pink-50 to-rose-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-pink-50/30">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-slate-900">{order.id}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-slate-900">{order.storeName}</p>
                      <p className="text-sm text-slate-500">{order.shippingAddress.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg text-sm font-medium">
                      {order.items.length} items
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap font-medium text-slate-900">
                    KES {order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                        title="View Order Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(order.id, 'approve')}
                            disabled={processingAction === `${order.id}-approve`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(order.id, 'reject')}
                            disabled={processingAction === `${order.id}-reject`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Tracking #"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="w-32 px-2 py-1 border border-slate-200 rounded text-sm"
                          />
                          <button
                            onClick={() => handleAction(order.id, 'ship')}
                            disabled={processingAction === `${order.id}-ship` || !trackingNumber}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                          >
                            <Truck size={14} />
                            Ship
                          </button>
                        </div>
                      )}
                      
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => handleAction(order.id, 'deliver')}
                          disabled={processingAction === `${order.id}-deliver`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          <Package size={14} />
                          Mark Delivered
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handleAction(order.id, 'mark-paid')}
                          disabled={processingAction === `${order.id}-mark-paid`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          <DollarSign size={14} />
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500">
              {statusFilter || searchQuery ? 'Try adjusting your filters' : 'Resellers haven\'t placed any orders yet'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Order Details - {selectedOrder.id}</h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Store & Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package size={16} />
                    Store Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Store:</span> {selectedOrder.storeName}</p>
                    <p><span className="text-slate-500">Store ID:</span> {selectedOrder.storeId}</p>
                    <p><span className="text-slate-500">Contact:</span> {selectedOrder.shippingAddress.name}</p>
                    <p><span className="text-slate-500">Phone:</span> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Truck size={16} />
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p>
                    <p><span className="text-slate-500">Phone:</span> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Order Items
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-sm font-medium text-slate-700">Product</th>
                      <th className="text-center py-2 text-sm font-medium text-slate-700">SKU</th>
                      <th className="text-center py-2 text-sm font-medium text-slate-700">Quantity</th>
                      <th className="text-right py-2 text-sm font-medium text-slate-700">Unit Price</th>
                      <th className="text-right py-2 text-sm font-medium text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-sm">{item.productName}</td>
                        <td className="text-center py-3 text-sm text-slate-500">{item.productId}</td>
                        <td className="text-center py-3 text-sm">{item.quantity}</td>
                        <td className="text-right py-3 text-sm">KES {item.unitPrice.toFixed(2)}</td>
                        <td className="text-right py-3 text-sm font-medium">KES {item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Order Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><span className="text-slate-500">Updated:</span> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign size={16} />
                    Payment Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Status:</span> <span className={`font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span></p>
                    <p><span className="text-slate-500">Subtotal:</span> KES {selectedOrder.subtotal.toFixed(2)}</p>
                    <p><span className="text-slate-500">Tax:</span> KES {selectedOrder.tax.toFixed(2)}</p>
                    <p className="font-semibold"><span className="text-slate-500">Total:</span> KES {selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Order Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Current:</span> <span className={`font-medium ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                    {selectedOrder.trackingNumber && (
                      <p><span className="text-slate-500">Tracking:</span> {selectedOrder.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'delivered') && (
                  <button
                    onClick={() => {
                      // Generate invoice
                      const invoice: InvoiceData = {
                        invoiceNumber: `INV-${selectedOrder.id}`,
                        date: selectedOrder.createdAt,
                        dueDate: new Date(new Date(selectedOrder.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        billTo: {
                          name: selectedOrder.shippingAddress.name,
                          address: `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.country}`,
                          phone: selectedOrder.shippingAddress.phone
                        },
                        items: selectedOrder.items,
                        subtotal: selectedOrder.subtotal,
                        discount: selectedOrder.discount,
                        tax: selectedOrder.tax,
                        total: selectedOrder.total,
                        paymentInstructions: {
                          bankName: 'Equity Bank Kenya',
                          accountName: "KoreaCosmetics' Wholesale Ltd",
                          accountNumber: '1234567890',
                          swiftCode: 'EQBLKENA',
                          reference: `INV-${selectedOrder.id}`
                        }
                      };
                      setInvoiceData(invoice);
                      setShowOrderDetails(false);
                      setShowInvoice(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                  >
                    <FileText size={18} />
                    Generate Invoice
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8" id="invoice" ref={invoiceRef}>
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                  <p className="text-slate-500">{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Date: {new Date(invoiceData.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">Due: {new Date(invoiceData.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-8 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-slate-700 mb-2">Bill To:</h3>
                <p className="font-medium text-slate-900">{invoiceData.billTo.name}</p>
                <p className="text-slate-600">{invoiceData.billTo.address}</p>
                <p className="text-slate-600">{invoiceData.billTo.phone}</p>
              </div>

              {/* Items */}
              <table className="w-full mb-8">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 text-sm font-medium text-slate-700">Item</th>
                    <th className="text-center py-2 text-sm font-medium text-slate-700">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-700">Unit Price</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3">{item.productName}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">KES {item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-3">KES {item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal:</span>
                    <span>KES {invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount:</span>
                    <span className="text-green-600">-KES {invoiceData.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax:</span>
                    <span>KES {invoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Due:</span>
                    <span>KES {invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="p-4 bg-slate-50 rounded-lg mb-6">
                <h3 className="font-medium text-slate-700 mb-3">Payment Instructions</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-500">Bank:</span> {invoiceData.paymentInstructions.bankName}</p>
                  <p><span className="text-slate-500">Account Name:</span> {invoiceData.paymentInstructions.accountName}</p>
                  <p><span className="text-slate-500">Account Number:</span> {invoiceData.paymentInstructions.accountNumber}</p>
                  <p><span className="text-slate-500">SWIFT Code:</span> {invoiceData.paymentInstructions.swiftCode}</p>
                  <p><span className="text-slate-500">Reference:</span> <strong>{invoiceData.paymentInstructions.reference}</strong></p>
                </div>
              </div>
            </div>

            {/* Invoice Actions */}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowInvoice(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <Printer size={18} />
                Print
              </button>
              {invoiceData && (
                <PDFDownloadLink
                  document={<InvoicePDF invoiceData={invoiceData} />}
                  fileName={`invoice-${invoiceData.invoiceNumber}.pdf`}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  {({ loading }) => (
                    <>
                      <Download size={18} />
                      {loading ? 'Generating...' : 'Download PDF'}
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
