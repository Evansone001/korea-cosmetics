'use client'
import { useState, useEffect } from 'react'
import { 
    Search, Filter, Package, Truck, CheckCircle, XCircle, Clock,
    MapPin, User, Calendar, DollarSign, MoreHorizontal, Eye,
    Download, Printer, ChevronDown, ArrowRight, Phone, Mail,
    Box, ShoppingBag, AlertCircle, RotateCcw, Store, Copy, ExternalLink, Navigation
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface OrderItem {
    id: string
    name: string
    quantity: number
    price: number
    image?: string
}

interface Order {
    id: string
    orderNumber: string
    type: 'retail' | 'b2b'
    customer: {
        name: string
        email: string
        phone: string
        address: string
        company?: string
    }
    items: OrderItem[]
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
    paymentMethod: string
    total: number
    subtotal: number
    shipping: number
    tax: number
    createdAt: string
    updatedAt: string
    notes?: string
    trackingNumber?: string
    // Cancellation details
    cancelledAt?: string
    cancelledBy?: 'customer' | 'admin'
    cancelReason?: string
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

export default function AdminOrders() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<'all' | 'retail' | 'b2b'>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showTrackingModal, setShowTrackingModal] = useState(false)
    const [showStatusNoteModal, setShowStatusNoteModal] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [shipChannel, setShipChannel] = useState<'own_driver' | 'courier'>('own_driver')
    const [shipCarrierName, setShipCarrierName] = useState('')
    const [driverLink, setDriverLink] = useState<string | null>(null)
    const [statusNote, setStatusNote] = useState('')
    const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; newStatus: Order['status'] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Orders data from backend
    const [orders, setOrders] = useState<Order[]>([])

    // Fetch orders from backend
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch both B2C and B2B orders
            const [b2cResponse, b2bResponse] = await Promise.all([
                apiClient.getStoreOrders({ status: statusFilter === 'all' ? undefined : statusFilter }),
                apiClient.getWholesaleOrders({ status: statusFilter === 'all' ? undefined : statusFilter })
            ])

            // Map backend data to frontend Order interface
            const mappedOrders: Order[] = []

            // Process B2C orders
            if (b2cResponse.orders) {
                b2cResponse.orders.forEach((order: any) => {
                    mappedOrders.push({
                        id: order.id,
                        orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
                        type: 'retail',
                        customer: {
                            name: order.customer?.name || 'Unknown',
                            email: order.customer?.email || '',
                            phone: order.customer?.phone || '',
                            address: order.shipping_address?.street || ''
                        },
                        items: order.items || [],
                        status: order.status,
                        paymentStatus: order.is_paid ? 'paid' : 'pending',
                        paymentMethod: order.payment_method || 'Unknown',
                        total: order.total ?? 0,
                        subtotal: order.total ?? 0,
                        shipping: 0,
                        tax: 0,
                        createdAt: order.created_at,
                        updatedAt: order.updated_at,
                        trackingNumber: order.tracking_number
                    })
                })
            }

            // Process B2B orders
            if (b2bResponse.orders) {
                b2bResponse.orders.forEach((order: any) => {
                    const normalizedItems = (order.items || []).map((item: any) => ({
                        id: item.product_id || item.id || '',
                        name: item.name || item.product_name || 'Unknown Product',
                        quantity: item.quantity || 0,
                        price: item.price || item.unit_price || 0,
                        image: item.image || undefined
                    }))
                    mappedOrders.push({
                        id: order.id,
                        orderNumber: `B2B-${order.id.slice(0, 8).toUpperCase()}`,
                        type: 'b2b',
                        customer: {
                            name: order.customer?.name || 'Unknown',
                            email: order.customer?.email || '',
                            phone: order.customer?.phone || '',
                            address: order.shipping_address?.street || '',
                            company: order.store_name || ''
                        },
                        items: normalizedItems,
                        status: order.status,
                        paymentStatus: order.is_paid ? 'paid' : 'pending',
                        paymentMethod: order.payment_method || 'Unknown',
                        total: order.total ?? order.total_amount ?? 0,
                        subtotal: order.total ?? order.total_amount ?? 0,
                        shipping: 0,
                        tax: 0,
                        createdAt: order.created_at,
                        updatedAt: order.updated_at,
                        trackingNumber: order.tracking_number
                    })
                })
            }

            setOrders(mappedOrders)
        } catch (err) {
            console.error('Failed to fetch orders:', err)
            setError('Failed to load orders')
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [statusFilter])

    const handleStatusChange = async (orderId: string, newStatus: Order['status'], note?: string) => {
        try {
            await apiClient.updateOrderStatus(orderId, newStatus, note)
            toast.success(`Order status updated to ${newStatus}`)
            fetchOrders()
        } catch (error) {
            console.error('Failed to update order status:', error)
            toast.error('Failed to update order status')
        }
    }

    const handleShipOrder = async (orderId: string) => {
        try {
            const order = orders.find(o => o.id === orderId)
            if (order?.type === 'b2b') {
                await apiClient.handleWarehouseOrderAction(orderId, 'ship', trackingNumber)
            }
            const res: any = await apiClient.shipOrder(orderId, {
                shipping_channel: shipChannel,
                tracking_number: trackingNumber.trim() || undefined,
                carrier_name: shipCarrierName.trim() || undefined,
            })
            if (res?.driver_token) {
                const link = `${window.location.origin}/driver/${orderId}?token=${res.driver_token}`
                setDriverLink(link)
            }
            toast.success('Order shipped successfully')
            fetchOrders()
        } catch (error: any) {
            console.error('Failed to ship order:', error)
            const msg = error?.response?.data?.error || 'Failed to ship order'
            toast.error(msg)
        }
        setTrackingNumber('')
    }

    // Handle warehouse/B2B order actions (approve, deliver, etc.)
    const handleWarehouseAction = async (orderId: string, action: string) => {
        try {
            await apiClient.handleWarehouseOrderAction(orderId, action)
            toast.success(`Order ${action}d successfully`)
            fetchOrders()
        } catch (error) {
            console.error(`Failed to ${action} order:`, error)
            toast.error(`Failed to ${action} order`)
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.phone.includes(searchQuery)
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
        const matchesType = typeFilter === 'all' || order.type === typeFilter
        return matchesSearch && matchesStatus && matchesPayment && matchesType
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

    const TypeBadge = ({ type }: { type: Order['type'] }) => {
        const config = {
            retail: { label: 'Retail', color: 'bg-green-100 text-green-700 border-green-200', icon: ShoppingBag },
            b2b: { label: 'B2B', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Store }
        }[type]
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
                    <p className="text-slate-500 mt-1">Track and manage all customer orders</p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-slate-500">Loading orders...</div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
            <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/orders/retail"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Retail Orders
                    </Link>
                    <Link 
                        href="/admin/wholesale-orders"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Store className="w-4 h-4" />
                        Wholesale Orders
                    </Link>
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

            {/* Order Type Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        typeFilter === 'all' 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    All Orders ({orders.length})
                </button>
                <button
                    onClick={() => setTypeFilter('retail')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        typeFilter === 'retail' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    Retail ({orders.filter(o => o.type === 'retail').length})
                </button>
                <button
                    onClick={() => setTypeFilter('b2b')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        typeFilter === 'b2b' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <Store className="w-4 h-4" />
                    B2B ({orders.filter(o => o.type === 'b2b').length})
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total Orders</span>
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Pending</span>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Processing</span>
                        <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'processing').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Shipped</span>
                        <Truck className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'shipped').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Cancelled</span>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.filter(o => o.status === 'cancelled').length}</p>
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
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by order number, customer name, email or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap">
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
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                        >
                            <option value="all">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Order</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Type</th>
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
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-800">{order.orderNumber}</p>
                                            <p className="text-xs text-slate-500">{order.items.length} items</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <TypeBadge type={order.type} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                {order.customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{order.customer.name}</p>
                                                {order.customer.company && (
                                                    <p className="text-xs text-blue-600">{order.customer.company}</p>
                                                )}
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
                                            {order.items.length > 2 && (
                                                <p className="text-xs text-slate-400">+{order.items.length - 2} more</p>
                                            )}
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
                                            {order.paymentStatus === 'paid' && <CheckCircle className="w-3 h-3" />}
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => {
                                                    setSelectedOrder(order)
                                                    setShowOrderModal(true)
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {order.status === 'pending' && (
                                                <button 
                                                    onClick={() => {
                                                        if (order.type === 'b2b') {
                                                            handleWarehouseAction(order.id, 'approve')
                                                        } else {
                                                            handleStatusChange(order.id, 'processing')
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                    title={order.type === 'b2b' ? 'Approve Order' : 'Start Processing'}
                                                >
                                                    <Package className="w-4 h-4" />
                                                </button>
                                            )}
                                            {order.status === 'processing' && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setShipChannel('own_driver')
                                                        setShipCarrierName('')
                                                        setTrackingNumber('')
                                                        setDriverLink(null)
                                                        setShowTrackingModal(true)
                                                    }}
                                                    className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
                                                    title="Mark as Shipped"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button 
                                                    onClick={() => {
                                                        if (order.type === 'b2b') {
                                                            handleWarehouseAction(order.id, 'deliver')
                                                        } else {
                                                            handleStatusChange(order.id, 'delivered')
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                                    title="Mark as Delivered"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(order.status === 'pending' || order.status === 'processing') && (
                                                <button 
                                                    onClick={() => {
                                                        if (order.type === 'b2b') {
                                                            handleWarehouseAction(order.id, 'reject')
                                                        } else {
                                                            setPendingStatusChange({ orderId: order.id, newStatus: 'cancelled' })
                                                            setShowStatusNoteModal(true)
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                    title={order.type === 'b2b' ? 'Reject Order' : 'Cancel Order'}
                                                >
                                                    <XCircle className="w-4 h-4" />
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
                    <div className="text-center py-12">
                        <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No orders found</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedOrder.orderNumber}</h3>
                                    <p className="text-slate-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
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
                            {/* Status & Payment & Type */}
                            <div className="flex flex-wrap gap-3">
                                <StatusBadge status={selectedOrder.status} />
                                <TypeBadge type={selectedOrder.type} />
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${PAYMENT_STATUSES[selectedOrder.paymentStatus].bg} ${PAYMENT_STATUSES[selectedOrder.paymentStatus].color}`}>
                                    Payment: {selectedOrder.paymentStatus}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h4 className="font-semibold text-slate-800 mb-3">Customer Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-800">{selectedOrder.customer.name}</span>
                                    </div>
                                    {selectedOrder.customer.company && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Store className="w-4 h-4 text-blue-500" />
                                            <span className="text-blue-600 font-medium">{selectedOrder.customer.company}</span>
                                        </div>
                                    )}
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

                            {/* Order Items */}
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

                            {/* Order Summary */}
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

                            {/* Tracking Info */}
                            {selectedOrder.trackingNumber && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Tracking Information</h4>
                                    <p className="text-sm text-blue-600">Tracking Number: {selectedOrder.trackingNumber}</p>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-yellow-800">Notes</h4>
                                            <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cancellation Details */}
                            {selectedOrder.status === 'cancelled' && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <h4 className="font-semibold text-red-800">Cancellation Details</h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-red-600">Cancelled By:</span>
                                            <span className="font-medium text-red-800">
                                                {selectedOrder.cancelledBy === 'customer' ? 'Customer' : 'Admin'}
                                            </span>
                                        </div>
                                        {selectedOrder.cancelledAt && (
                                            <div className="flex justify-between">
                                                <span className="text-red-600">Cancelled At:</span>
                                                <span className="font-medium text-red-800">
                                                    {new Date(selectedOrder.cancelledAt).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedOrder.cancelReason && (
                                            <div className="pt-2 border-t border-red-200">
                                                <span className="text-red-600">Reason:</span>
                                                <p className="mt-1 text-red-800">{selectedOrder.cancelReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Number Modal */}
            {showTrackingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Ship Order</h3>
                        <p className="text-slate-500 mb-6">
                            Enter tracking information for <span className="font-medium">{selectedOrder.orderNumber}</span>
                        </p>

                        {!driverLink ? (
                            <>
                                {/* Channel selector */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button
                                        onClick={() => setShipChannel('own_driver')}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm ${
                                            shipChannel === 'own_driver'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <Navigation size={18} />
                                        <span className="font-medium">Own Driver</span>
                                        <span className="text-xs opacity-60">Live GPS pin</span>
                                    </button>
                                    <button
                                        onClick={() => setShipChannel('courier')}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm ${
                                            shipChannel === 'courier'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <Truck size={18} />
                                        <span className="font-medium">Courier</span>
                                        <span className="text-xs opacity-60">Tracking #</span>
                                    </button>
                                </div>

                                <div className="space-y-3 mb-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tracking Number {shipChannel === 'courier' ? <span className="text-red-500">*</span> : <span className="text-slate-400">(optional)</span>}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., KEN123456789"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    {shipChannel === 'courier' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Carrier Name (optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. DHL, G4S, Sendy"
                                                value={shipCarrierName}
                                                onChange={(e) => setShipCarrierName(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowTrackingModal(false)
                                            setTrackingNumber('')
                                            setShipCarrierName('')
                                            setDriverLink(null)
                                        }}
                                        className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleShipOrder(selectedOrder.id)}
                                        disabled={shipChannel === 'courier' && !trackingNumber.trim()}
                                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Truck className="w-4 h-4" />
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
                                            onClick={() => { navigator.clipboard.writeText(driverLink!); toast.success('Link copied!') }}
                                            className="p-1 hover:bg-green-100 rounded"
                                            title="Copy link"
                                        >
                                            <Copy size={14} className="text-green-700" />
                                        </button>
                                        <a href={driverLink} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-green-100 rounded">
                                            <ExternalLink size={14} className="text-green-700" />
                                        </a>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Hi! Here is your delivery tracking link for order ${selectedOrder?.orderNumber}. Open this on your phone to share your live location with the customer: ${driverLink}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe5d] transition-colors text-sm font-medium"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            Send via WhatsApp
                                        </a>
                                        <a
                                            href={`sms:?body=${encodeURIComponent(`Delivery link for order ${selectedOrder?.orderNumber}: ${driverLink}`)}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                        >
                                            <Phone size={14} />
                                            Send via SMS
                                        </a>
                                    </div>
                                    <p className="text-xs text-green-600 mt-2">Driver opens the link on their phone to share live GPS location.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowTrackingModal(false)
                                        setDriverLink(null)
                                    }}
                                    className="w-full py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Status Note Modal */}
            {showStatusNoteModal && pendingStatusChange && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {pendingStatusChange.newStatus === 'cancelled' ? 'Cancel Order' : 'Change Order Status'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {pendingStatusChange.newStatus === 'cancelled' 
                                ? 'Add a reason for cancelling this order (optional)'
                                : 'Add a note for this status change (optional)'}
                        </p>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {pendingStatusChange.newStatus === 'cancelled' ? 'Reason' : 'Note'}
                                </label>
                                <textarea
                                    placeholder={pendingStatusChange.newStatus === 'cancelled' ? 'e.g., Out of stock, Customer request' : 'e.g., Priority shipment, Special handling'}
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowStatusNoteModal(false)
                                    setStatusNote('')
                                    setPendingStatusChange(null)
                                }}
                                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    handleStatusChange(pendingStatusChange.orderId, pendingStatusChange.newStatus, statusNote)
                                    setShowStatusNoteModal(false)
                                    setStatusNote('')
                                    setPendingStatusChange(null)
                                }}
                                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {pendingStatusChange.newStatus === 'cancelled' ? 'Cancel Order' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    )
}
