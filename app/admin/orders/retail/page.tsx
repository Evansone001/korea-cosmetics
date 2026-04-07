'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
    Search, Package, Truck, CheckCircle, XCircle, Clock, RotateCcw,
    MapPin, User, DollarSign, Eye, Download, Printer, 
    Box, ShoppingBag, ArrowLeft, Phone, Mail, Home
} from 'lucide-react'

interface OrderItem {
    id: string
    name: string
    quantity: number
    price: number
}

interface Order {
    id: string
    orderNumber: string
    type: 'retail'
    customer: {
        name: string
        email: string
        phone: string
        address: string
    }
    items: OrderItem[]
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
    paymentMethod: string
    total: number
    subtotal: number
    shipping: number
    createdAt: string
    trackingNumber?: string
    notes?: string
}

const ORDER_STATUSES = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: RotateCcw }
}

const PAYMENT_STATUSES = {
    paid: { label: 'Paid', color: 'text-green-600', bg: 'bg-green-50' },
    pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
    refunded: { label: 'Refunded', color: 'text-gray-600', bg: 'bg-gray-50' }
}

export default function RetailOrders() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showOrderModal, setShowOrderModal] = useState(false)

    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'ord_1',
            orderNumber: 'RET-2026-001',
            type: 'retail',
            customer: {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                phone: '+254 712 345 678',
                address: '123 Kimathi Street, Nairobi, Kenya'
            },
            items: [
                { id: 'item_1', name: 'Korean Snail Mucin Essence', quantity: 2, price: 1299 },
                { id: 'item_2', name: 'Vitamin C Brightening Serum', quantity: 1, price: 899 }
            ],
            status: 'pending',
            paymentStatus: 'paid',
            paymentMethod: 'M-Pesa',
            subtotal: 3497,
            shipping: 150,
            total: 3647,
            createdAt: '2026-01-15T10:30:00'
        },
        {
            id: 'ord_3',
            orderNumber: 'RET-2026-003',
            type: 'retail',
            customer: {
                name: 'Alice Johnson',
                email: 'alice.j@example.com',
                phone: '+254 734 567 890',
                address: '789 Kenyatta Avenue, Kisumu, Kenya'
            },
            items: [
                { id: 'item_5', name: 'Niacinamide Serum 10%', quantity: 3, price: 699 }
            ],
            status: 'shipped',
            paymentStatus: 'paid',
            paymentMethod: 'M-Pesa',
            subtotal: 2097,
            shipping: 150,
            total: 2247,
            createdAt: '2026-01-14T16:45:00',
            trackingNumber: 'KEN123456789',
            notes: 'Customer requested morning delivery'
        },
        {
            id: 'ord_5',
            orderNumber: 'RET-2026-005',
            type: 'retail',
            customer: {
                name: 'Carol Martinez',
                email: 'carol.m@example.com',
                phone: '+254 756 789 012',
                address: '654 Haile Selassie Avenue, Nairobi, Kenya'
            },
            items: [
                { id: 'item_7', name: 'Aloe Vera Gel', quantity: 1, price: 499 }
            ],
            status: 'delivered',
            paymentStatus: 'paid',
            paymentMethod: 'M-Pesa',
            subtotal: 499,
            shipping: 100,
            total: 599,
            createdAt: '2026-01-13T11:00:00'
        }
    ])

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId 
                ? { ...order, status: newStatus }
                : order
        ))
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const StatusBadge = ({ status }: { status: Order['status'] }) => {
        const config = ORDER_STATUSES[status]
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/orders"
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Retail Orders</h1>
                        <p className="text-slate-500 mt-1">Individual customer orders</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total Retail Orders</span>
                        <ShoppingBag className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Revenue</span>
                        <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                        KShs {orders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => acc + o.total, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Avg Order Value</span>
                        <Home className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                        KShs {Math.round(orders.reduce((acc, o) => acc + o.total, 0) / orders.length).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Pending</span>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by order number or customer name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Order</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Items</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Total</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Payment</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-800">{order.orderNumber}</p>
                                            <p className="text-xs text-slate-500">{order.items.length} items</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                {order.customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{order.customer.name}</p>
                                                <p className="text-xs text-slate-500">{order.customer.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {order.items.slice(0, 2).map((item, i) => (
                                                <p key={i} className="text-sm text-slate-600">
                                                    {item.quantity}x {item.name}
                                                </p>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">KShs {order.total.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">{order.paymentMethod}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${PAYMENT_STATUSES[order.paymentStatus].bg} ${PAYMENT_STATUSES[order.paymentStatus].color}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No retail orders found</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOrderModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <ShoppingBag className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{selectedOrder.orderNumber}</h3>
                                        <p className="text-slate-500">Retail Order • {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowOrderModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <StatusBadge status={selectedOrder.status} />
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${PAYMENT_STATUSES[selectedOrder.paymentStatus].bg} ${PAYMENT_STATUSES[selectedOrder.paymentStatus].color}`}>
                                    Payment: {selectedOrder.paymentStatus}
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4">
                                <h4 className="font-semibold text-slate-800 mb-3">Customer Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-800">{selectedOrder.customer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{selectedOrder.customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{selectedOrder.customer.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <span className="text-slate-600">{selectedOrder.customer.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-800 mb-3">Order Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-slate-800">KShs {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="text-slate-800">KShs {selectedOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Shipping</span>
                                        <span className="text-slate-800">KShs {selectedOrder.shipping.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-200">
                                        <span className="font-semibold text-slate-800">Total</span>
                                        <span className="font-bold text-slate-800 text-lg">KShs {selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.trackingNumber && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Tracking Information</h4>
                                    <p className="text-sm text-blue-600">Tracking Number: {selectedOrder.trackingNumber}</p>
                                </div>
                            )}

                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <p className="text-sm text-yellow-700"><span className="font-medium">Note:</span> {selectedOrder.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                {selectedOrder.status === 'pending' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Start Processing
                                    </button>
                                )}
                                {selectedOrder.status === 'processing' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Mark as Shipped
                                    </button>
                                )}
                                {selectedOrder.status === 'shipped' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                                        className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                                        className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
