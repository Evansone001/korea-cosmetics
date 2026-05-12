'use client'
import { useState, useEffect } from 'react'
import { Search, MapPin, Package, Truck, CheckCircle, XCircle, Clock, Store, TrendingUp, Users, DollarSign, Eye, Settings, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'

interface B2COrder {
    id: string
    orderNumber: string
    customer: {
        name: string
        email: string
        phone: string
        address: string
        city: string
        country: string
    }
    items: Array<{
        id: string
        name: string
        quantity: number
        price: number
    }>
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
    total: number
    createdAt: string
    assignedStore?: {
        id: string
        name: string
        distance: number
        capacity: number
    }
    estimatedDelivery?: string
}

interface Store {
    id: string
    name: string
        city: string
        country: string
        capacity: number
        currentLoad: number
        distance: number
        isActive: boolean
}

const ORDER_STATUSES = {
    pending: { label: 'Pending Assignment', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle }
}

export default function B2COrderManagement() {
    const [orders, setOrders] = useState<B2COrder[]>([])
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<B2COrder | null>(null)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showAssignmentModal, setShowAssignmentModal] = useState(false)
    const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<B2COrder | null>(null)
    const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto')
    const [selectedStore, setSelectedStore] = useState<string>('')

    useEffect(() => {
        fetchOrders()
        fetchStores()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getB2COrders()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('Failed to fetch B2C orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const fetchStores = async () => {
        try {
            const data = await apiClient.getB2CStores()
            setStores(data.stores || [])
        } catch (error) {
            console.error('Failed to fetch stores:', error)
            toast.error('Failed to load stores')
        }
    }

    const handleAutoAssign = async (orderId: string) => {
        try {
            const order = orders.find(o => o.id === orderId)
            if (!order) return

            const data = await apiClient.autoAssignB2COrder(orderId)
            
            // Update orders list with assigned store
            setOrders(prev => prev.map(o => 
                o.id === orderId 
                    ? { ...o, assignedStore: data.assignedStore }
                    : o
            ))

            toast.success(`Order assigned to ${data.assignedStore?.name || 'optimal store'}`)
            setShowAssignmentModal(false)
        } catch (error) {
            console.error('Failed to auto-assign order:', error)
            toast.error('Failed to assign order')
        }
    }

    const handleManualAssign = async (orderId: string, storeId: string) => {
        try {
            if (!selectedStore) {
                toast.error('Please select a store')
                return
            }

            const data = await apiClient.manualAssignB2COrder(orderId, storeId)
            
            // Update orders list with assigned store
            setOrders(prev => prev.map(o => 
                o.id === orderId 
                    ? { ...o, assignedStore: data.assignedStore }
                    : o
            ))

            toast.success(`Order manually assigned to ${data.assignedStore?.name || 'selected store'}`)
            setShowAssignmentModal(false)
            setSelectedStore('')
        } catch (error) {
            console.error('Failed to manually assign order:', error)
            toast.error('Failed to assign order')
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesStatus = !statusFilter || order.status === statusFilter
        const matchesSearch = !searchQuery || 
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const getStatusColor = (status: string) => ORDER_STATUSES[status as keyof typeof ORDER_STATUSES]?.color || 'bg-slate-100 text-slate-700'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">B2C Order Management</h1>
                    <p className="text-slate-500 mt-1">Automated order assignment and fulfillment tracking</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowRight size={16} />
                        Back to Orders
                    </Link>
                    <button className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
                        <Settings size={16} />
                        Assignment Settings
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total B2C Orders</span>
                        <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">{orders.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Pending Assignment</span>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Auto-Assigned</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                        {orders.filter(o => o.assignedStore).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Avg Delivery Time</span>
                        <Truck className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">2.3 days</p>
                </div>
            </div>

            {/* Assignment Mode Toggle */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Assignment Mode</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setAssignmentMode('auto')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            assignmentMode === 'auto'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <BarChart3 size={16} className="mr-2" />
                        Auto Assignment
                    </button>
                    <button
                        onClick={() => setAssignmentMode('manual')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            assignmentMode === 'manual'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <Users size={16} className="mr-2" />
                        Manual Assignment
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">B2C Orders</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by order number, customer name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 w-64"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending Assignment</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Order</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Items</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Total</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Assigned Store</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-800">{order.orderNumber}</p>
                                            <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{order.customer.name}</p>
                                                <p className="text-xs text-slate-500">{order.customer.email}</p>
                                                <p className="text-xs text-slate-500">{order.customer.city}</p>
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
                                        <p className="font-medium text-slate-800">${order.total.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.assignedStore ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Store className="w-3 h-3 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{order.assignedStore.name}</p>
                                                    <p className="text-xs text-slate-500">{order.assignedStore.distance}km away</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-amber-600 font-medium">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {!order.assignedStore && (
                                                <button
                                                    onClick={() => { setSelectedOrderForAssignment(order); setShowAssignmentModal(true); }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                                    title="Assign to store"
                                                >
                                                    <MapPin className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOrderModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Order Details - {selectedOrder.orderNumber}</h3>
                            <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-3">Customer Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500">Name:</span> {selectedOrder.customer.name}</p>
                                        <p><span className="text-slate-500">Email:</span> {selectedOrder.customer.email}</p>
                                        <p><span className="text-slate-500">Phone:</span> {selectedOrder.customer.phone}</p>
                                        <p><span className="text-slate-500">Address:</span> {selectedOrder.customer.address}</p>
                                        <p><span className="text-slate-500">City:</span> {selectedOrder.customer.city}, {selectedOrder.customer.country}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.name}</p>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium text-slate-800">${item.price.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {selectedOrder.estimatedDelivery && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Estimated Delivery</h4>
                                    <p className="text-blue-600">{selectedOrder.estimatedDelivery}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignmentModal && selectedOrderForAssignment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignmentModal(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Assign Order - {selectedOrderForAssignment.orderNumber}</h3>
                            <button onClick={() => setShowAssignmentModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            {assignmentMode === 'auto' ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-800 mb-2">Auto-Assignment</h4>
                                        <p className="text-blue-600 mb-4">
                                            System will automatically assign this order to the optimal store based on:
                                        </p>
                                        <ul className="space-y-1 text-sm text-blue-600">
                                            <li>• Store capacity and current load</li>
                                            <li>• Geographic proximity to customer</li>
                                            <li>• Store availability and active status</li>
                                        </ul>
                                        <button
                                            onClick={() => handleAutoAssign(selectedOrderForAssignment.id)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Auto-Assign Order
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-slate-800 mb-3">Select Store</h4>
                                        <select
                                            value={selectedStore}
                                            onChange={(e) => setSelectedStore(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        >
                                            <option value="">Choose a store...</option>
                                            {stores.filter(store => store.isActive).map(store => (
                                                <option key={store.id} value={store.id}>
                                                    {store.name} ({store.city}) - Capacity: {store.capacity - store.currentLoad}/{store.capacity}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => handleManualAssign(selectedOrderForAssignment.id, selectedStore)}
                                        disabled={!selectedStore}
                                        className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Assign to Selected Store
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
