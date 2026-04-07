'use client'
import { useState } from 'react'
import { 
    Search, Filter, Package, Truck, CheckCircle, XCircle, Clock,
    MapPin, User, Calendar, DollarSign, MoreHorizontal, Eye,
    Download, Printer, ChevronDown, ArrowRight, Phone, Mail,
    Box, ShoppingBag, AlertCircle, RotateCcw, UserCheck, Store
} from 'lucide-react'
import Link from 'next/link'

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
    assignedTo?: string
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

// Sample delivery staff
const DELIVERY_STAFF = [
    { id: 'staff_1', name: 'Michael Johnson', phone: '+254 712 111 222', activeOrders: 3 },
    { id: 'staff_2', name: 'Sarah Williams', phone: '+254 723 333 444', activeOrders: 5 },
    { id: 'staff_3', name: 'David Brown', phone: '+254 734 555 666', activeOrders: 2 },
    { id: 'staff_4', name: 'Emily Davis', phone: '+254 745 777 888', activeOrders: 4 },
]

export default function AdminOrders() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<'all' | 'retail' | 'b2b'>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showTrackingModal, setShowTrackingModal] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')

    // Sample orders data
    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'ord_1',
            orderNumber: 'ORD-2026-001',
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
            tax: 0,
            total: 3647,
            createdAt: '2026-01-15T10:30:00',
            updatedAt: '2026-01-15T10:30:00'
        },
        {
            id: 'ord_2',
            orderNumber: 'ORD-2026-002',
            type: 'b2b',
            customer: {
                name: 'John Smith',
                email: 'john.smith@kbeauty.com',
                phone: '+254 723 456 789',
                address: '456 Moi Avenue, Mombasa, Kenya',
                company: 'KBeauty Kenya Ltd'
            },
            items: [
                { id: 'item_3', name: 'Hyaluronic Acid Moisturizer (Bulk)', quantity: 50, price: 599 },
                { id: 'item_4', name: 'Retinol Night Cream (Bulk)', quantity: 30, price: 1199 }
            ],
            status: 'processing',
            paymentStatus: 'paid',
            paymentMethod: 'Bank Transfer',
            subtotal: 65950,
            shipping: 0,
            tax: 9892,
            total: 75842,
            createdAt: '2026-01-15T09:15:00',
            updatedAt: '2026-01-15T11:20:00',
            assignedTo: 'staff_1'
        },
        {
            id: 'ord_3',
            orderNumber: 'ORD-2026-003',
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
            tax: 0,
            total: 2247,
            createdAt: '2026-01-14T16:45:00',
            updatedAt: '2026-01-15T08:30:00',
            assignedTo: 'staff_2',
            trackingNumber: 'KEN123456789',
            notes: 'Customer requested morning delivery'
        },
        {
            id: 'ord_4',
            orderNumber: 'ORD-2026-004',
            type: 'b2b',
            customer: {
                name: 'Bob Williams',
                email: 'bob@seoulbeauty.co.ke',
                phone: '+254 745 678 901',
                address: '321 Tom Mboya Street, Nakuru, Kenya',
                company: 'Seoul Beauty Supply'
            },
            items: [
                { id: 'item_6', name: 'Sunscreen SPF 50 (Bulk)', quantity: 100, price: 699 }
            ],
            status: 'delivered',
            paymentStatus: 'paid',
            paymentMethod: 'Bank Transfer',
            subtotal: 69900,
            shipping: 0,
            tax: 10485,
            total: 80385,
            createdAt: '2026-01-13T14:20:00',
            updatedAt: '2026-01-14T16:30:00',
            assignedTo: 'staff_3'
        },
        {
            id: 'ord_5',
            orderNumber: 'ORD-2026-005',
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
            status: 'cancelled',
            paymentStatus: 'refunded',
            paymentMethod: 'M-Pesa',
            subtotal: 499,
            shipping: 0,
            tax: 0,
            total: 499,
            createdAt: '2026-01-13T11:00:00',
            updatedAt: '2026-01-13T12:15:00',
            cancelledAt: '2026-01-13T12:15:00',
            cancelledBy: 'customer',
            cancelReason: 'Changed my mind - found alternative product'
        },
        {
            id: 'ord_6',
            orderNumber: 'ORD-2026-006',
            type: 'b2b',
            customer: {
                name: 'David Kim',
                email: 'david@asiaimports.co.ke',
                phone: '+254 767 890 123',
                address: '789 Biashara Street, Nairobi, Kenya',
                company: 'Asia Imports Ltd'
            },
            items: [
                { id: 'item_8', name: 'Premium Face Mask Set (Bulk)', quantity: 200, price: 299 },
                { id: 'item_9', name: 'Collagen Eye Patches (Bulk)', quantity: 150, price: 399 }
            ],
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'Bank Transfer',
            subtotal: 119650,
            shipping: 0,
            tax: 17947,
            total: 137597,
            createdAt: '2026-01-16T08:00:00',
            updatedAt: '2026-01-16T08:00:00'
        }
    ])

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId 
                ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
                : order
        ))
    }

    const handleAssignDelivery = (orderId: string, staffId: string) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId 
                ? { ...order, assignedTo: staffId, status: 'processing', updatedAt: new Date().toISOString() }
                : order
        ))
        setShowAssignModal(false)
    }

    const handleShipOrder = (orderId: string, trackingNum: string) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId 
                ? { ...order, status: 'shipped', trackingNumber: trackingNum, updatedAt: new Date().toISOString() }
                : order
        ))
        setShowTrackingModal(false)
        setTrackingNumber('')
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

    const getAssignedStaffName = (staffId?: string) => {
        if (!staffId) return 'Unassigned'
        const staff = DELIVERY_STAFF.find(s => s.id === staffId)
        return staff ? staff.name : 'Unknown'
    }

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
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/orders/retail"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Retail Orders
                    </Link>
                    <Link 
                        href="/admin/orders/b2b"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Store className="w-4 h-4" />
                        B2B Orders
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

            {/* Delivery Staff Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    Delivery Staff Status
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {DELIVERY_STAFF.map(staff => (
                        <div key={staff.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                {staff.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 text-sm truncate">{staff.name}</p>
                                <p className="text-xs text-slate-500">{staff.activeOrders} active orders</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${staff.activeOrders < 5 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        </div>
                    ))}
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
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Assigned</th>
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
                                        {order.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-3 h-3 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-slate-600">{getAssignedStaffName(order.assignedTo)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">Unassigned</span>
                                        )}
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
                                                        setSelectedOrder(order)
                                                        setShowAssignModal(true)
                                                    }}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                    title="Assign to Staff"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                            )}
                                            {order.status === 'processing' && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order)
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
                                                    onClick={() => handleStatusChange(order.id, 'delivered')}
                                                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                                    title="Mark as Delivered"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(order.status === 'pending' || order.status === 'processing') && (
                                                <button 
                                                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                    title="Cancel Order"
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

                            {/* Assigned Staff */}
                            {selectedOrder.assignedTo && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">Assigned to {getAssignedStaffName(selectedOrder.assignedTo)}</p>
                                        <p className="text-xs text-slate-500">{DELIVERY_STAFF.find(s => s.id === selectedOrder.assignedTo)?.phone}</p>
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
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tracking Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., KEN123456789"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Enter the courier tracking number for this shipment
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowTrackingModal(false)
                                    setTrackingNumber('')
                                }}
                                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleShipOrder(selectedOrder.id, trackingNumber)}
                                disabled={!trackingNumber.trim()}
                                className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Truck className="w-4 h-4" />
                                Mark as Shipped
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Staff Modal */}
            {showAssignModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Assign to Delivery Staff</h3>
                        <p className="text-slate-500 mb-6">
                            Select a staff member to handle order <span className="font-medium">{selectedOrder.orderNumber}</span>
                        </p>
                        
                        <div className="space-y-3 mb-6">
                            {DELIVERY_STAFF.map(staff => (
                                <button
                                    key={staff.id}
                                    onClick={() => handleAssignDelivery(selectedOrder.id, staff.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-medium text-slate-800">{staff.name}</p>
                                        <p className="text-xs text-slate-500">{staff.phone}</p>
                                        <p className={`text-xs mt-1 ${staff.activeOrders < 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {staff.activeOrders} active orders
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setShowAssignModal(false)}
                            className="w-full py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
