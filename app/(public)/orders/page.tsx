'use client'
import { useState, useEffect } from 'react'
import PageTitle from "@/components/PageTitle";
import { Package, Truck, CheckCircle, Clock, XCircle, X, MapPin, CreditCard, User, ExternalLink, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface TrackingEvent {
    date: string
    time: string
    status: string
    location: string
    description: string
}

interface OrderItem {
    name: string
    quantity: number
    price: number
    image: string
}

interface ShippingAddress {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
}

interface Order {
    id: string
    date: string
    status: 'delivered' | 'processing' | 'shipped' | 'cancelled'
    total: number
    subtotal: number
    shipping: number
    tax: number
    paymentMethod: string
    shippingAddress: ShippingAddress
    trackingNumber?: string
    estimatedDelivery?: string
    items: OrderItem[]
}

export default function Orders() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [showTrackingModal, setShowTrackingModal] = useState(false)
    const [trackingOrder, setTrackingOrder] = useState<any>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelOrder, setCancelOrder] = useState<any>(null)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelError, setCancelError] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch orders from backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const response = await apiClient.getMyOrders()
                setOrders(response.orders || [])
            } catch (err) {
                console.error('Failed to fetch orders:', err)
                setError('Failed to load orders')
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'processing':
                return <Clock className="w-5 h-5 text-blue-600" />
            case 'shipped':
                return <Truck className="w-5 h-5 text-orange-600" />
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />
            default:
                return <Package className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
            case 'shipped':
                return 'bg-orange-100 text-orange-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const handleCancelOrder = async () => {
        if (!cancelReason) {
            setCancelError('Please select a reason for cancellation')
            return
        }
        
        try {
            // Call API to cancel order
            await apiClient.updateOrderStatus(cancelOrder.id, 'cancelled')
            
            // Refresh orders
            const response = await apiClient.getMyOrders()
            setOrders(response.orders || [])
            
            // Close modal and reset
            setShowCancelModal(false)
            setCancelOrder(null)
            setCancelReason('')
            setCancelError('')
            
            alert('Order cancelled successfully. Refund will be processed within 5-7 business days.')
        } catch (err) {
            console.error('Failed to cancel order:', err)
            alert('Failed to cancel order. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-900"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                <PageTitle heading="My Orders" text="Track and manage your orders" linkText="Continue Shopping" path="/shop" />

                {orders.length === 0 ? (
                    <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <h1 className="text-2xl sm:text-3xl font-semibold mb-2">No orders yet</h1>
                            <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
                            <button 
                                onClick={() => window.location.href = '/shop'}
                                className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Order {order.id}</h3>
                                        <p className="text-sm text-slate-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(order.status as Order['status'])}
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status as Order['status'])}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <h4 className="font-medium text-slate-900 mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center py-2">
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.name}</p>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium text-slate-900">
                                                    {currency}{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 mt-4 pt-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex space-x-4">
                                            <button 
                                                onClick={() => {
                                                    setTrackingOrder(order)
                                                    setShowTrackingModal(true)
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Track Order
                                            </button>
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                <button 
                                                    onClick={() => {
                                                        setCancelOrder(order)
                                                        setShowCancelModal(true)
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Total</p>
                                            <p className="text-lg font-semibold text-slate-900">
                                                {currency}{order.total.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-slate-900">Order Details</h2>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Order {selectedOrder.id}</h3>
                                    <p className="text-sm text-slate-500">Placed on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(selectedOrder.status as Order['status'])}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status as Order['status'])}`}>
                                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="border border-slate-200 rounded-lg p-4">
                                <h4 className="font-medium text-slate-900 mb-4">Order Items</h4>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{item.name}</p>
                                                <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-slate-900">
                                                {currency}{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Shipping Address */}
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <MapPin className="w-5 h-5 text-slate-600" />
                                        <h4 className="font-medium text-slate-900">Shipping Address</h4>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium text-slate-900">{selectedOrder.shippingAddress.name}</p>
                                        <p className="text-slate-600">{selectedOrder.shippingAddress.street}</p>
                                        <p className="text-slate-600">
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                                        </p>
                                        <p className="text-slate-600">{selectedOrder.shippingAddress.country}</p>
                                        <p className="text-slate-600">{selectedOrder.shippingAddress.phone}</p>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <CreditCard className="w-5 h-5 text-slate-600" />
                                        <h4 className="font-medium text-slate-900">Payment Information</h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Payment Method:</span>
                                            <span className="font-medium text-slate-900">{selectedOrder.paymentMethod}</span>
                                        </div>
                                        {selectedOrder.trackingNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Tracking Number:</span>
                                                <span className="font-medium text-slate-900">{selectedOrder.trackingNumber}</span>
                                            </div>
                                        )}
                                        {selectedOrder.estimatedDelivery && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Est. Delivery:</span>
                                                <span className="font-medium text-slate-900">
                                                    {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border border-slate-200 rounded-lg p-4">
                                <h4 className="font-medium text-slate-900 mb-4">Order Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-medium text-slate-900">{currency}{selectedOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Shipping:</span>
                                        <span className="font-medium text-slate-900">
                                            {selectedOrder.shipping === 0 ? 'Free' : currency + selectedOrder.shipping.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tax:</span>
                                        <span className="font-medium text-slate-900">{currency}{selectedOrder.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-slate-900">Total:</span>
                                            <span className="text-lg font-semibold text-slate-900">{currency}{selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                                    <button 
                                        onClick={() => {
                                            setCancelOrder(selectedOrder)
                                            setShowCancelModal(true)
                                            setSelectedOrder(null)
                                        }}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                <button 
                                    onClick={() => {
                                        setTrackingOrder(selectedOrder)
                                        setShowTrackingModal(true)
                                        setSelectedOrder(null)
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Track Order
                                </button>
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {showTrackingModal && trackingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-slate-900">Track Order</h2>
                            <button 
                                onClick={() => {
                                    setShowTrackingModal(false)
                                    setTrackingOrder(null)
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 mb-1">Order {trackingOrder.id}</p>
                                        <p className="text-xl font-semibold text-blue-800">{trackingOrder.trackingNumber || 'Not available'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-blue-600">Status</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingOrder.status as Order['status'])}`}>
                                            {trackingOrder.status.charAt(0).toUpperCase() + trackingOrder.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Timeline */}
                            {trackingOrder.trackingNumber && (
                                <div className="space-y-4">
                                    <h4 className="font-medium text-slate-900">Shipment Progress</h4>
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                                        
                                        {/* Timeline events */}
                                        <div className="space-y-6">
                                            {/* Event 1: Order Placed */}
                                            <div className="flex items-start gap-4 relative">
                                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center z-10">
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="font-medium text-slate-900">Order Placed</p>
                                                    <p className="text-sm text-slate-500">Your order has been confirmed and is being processed</p>
                                                    <p className="text-xs text-slate-400 mt-1">{new Date(trackingOrder.date).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {/* Event 2: Processing */}
                                            {(trackingOrder.status === 'processing' || trackingOrder.status === 'shipped' || trackingOrder.status === 'delivered') && (
                                                <div className="flex items-start gap-4 relative">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${trackingOrder.status === 'processing' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                        <Package className={`w-6 h-6 ${trackingOrder.status === 'processing' ? 'text-blue-600' : 'text-green-600'}`} />
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <p className="font-medium text-slate-900">Processing</p>
                                                        <p className="text-sm text-slate-500">Your order is being prepared for shipment</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(new Date(trackingOrder.date).getTime() + 86400000).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Event 3: Shipped */}
                                            {(trackingOrder.status === 'shipped' || trackingOrder.status === 'delivered') && (
                                                <div className="flex items-start gap-4 relative">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${trackingOrder.status === 'shipped' ? 'bg-orange-100' : 'bg-green-100'}`}>
                                                        <Truck className={`w-6 h-6 ${trackingOrder.status === 'shipped' ? 'text-orange-600' : 'text-green-600'}`} />
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <p className="font-medium text-slate-900">Shipped</p>
                                                        <p className="text-sm text-slate-500">Your order is on the way to you</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(new Date(trackingOrder.date).getTime() + 172800000).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Event 4: Delivered */}
                                            {trackingOrder.status === 'delivered' && (
                                                <div className="flex items-start gap-4 relative">
                                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center z-10">
                                                        <MapPin className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <p className="font-medium text-slate-900">Delivered</p>
                                                        <p className="text-sm text-slate-500">Package delivered to {trackingOrder.shippingAddress.name}</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(new Date(trackingOrder.date).getTime() + 259200000).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No tracking info */}
                            {!trackingOrder.trackingNumber && (
                                <div className="text-center py-8">
                                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Tracking Information Not Available</h3>
                                    <p className="text-slate-500">Your order is being processed. Tracking details will be updated once your order ships.</p>
                                </div>
                            )}

                            {/* Tracking Link */}
                            {trackingOrder.trackingNumber && (
                                <div className="border-t border-slate-200 pt-4">
                                    <a 
                                        href={`https://tracking.example.com/${trackingOrder.trackingNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Track on Courier Website
                                    </a>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                                <button 
                                    onClick={() => {
                                        setShowTrackingModal(false)
                                        setTrackingOrder(null)
                                    }}
                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && cancelOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-slate-900">Cancel Order</h2>
                            <button 
                                onClick={() => {
                                    setShowCancelModal(false)
                                    setCancelOrder(null)
                                    setCancelReason('')
                                    setCancelError('')
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <p className="text-sm text-red-600 mb-1">Order {cancelOrder.id}</p>
                                <p className="text-lg font-semibold text-red-800">{currency}{cancelOrder.total.toLocaleString()}</p>
                                <p className="text-sm text-red-600 mt-1">
                                    Status: {cancelOrder.status.charAt(0).toUpperCase() + cancelOrder.status.slice(1)}
                                </p>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Cancellation Policy
                                </h4>
                                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                                    <li>Orders can only be cancelled before they are shipped</li>
                                    <li>Refunds will be processed within 5-7 business days</li>
                                    <li>Original payment method will be credited</li>
                                    <li>Cancellations cannot be undone once confirmed</li>
                                </ul>
                            </div>

                            {/* Cancel Reason */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reason for Cancellation <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={cancelReason}
                                    onChange={(e) => {
                                        setCancelReason(e.target.value)
                                        setCancelError('')
                                    }}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${cancelError ? 'border-red-500' : 'border-slate-300'}`}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="changed_mind">Changed my mind</option>
                                    <option value="ordered_wrong">Ordered wrong item</option>
                                    <option value="found_cheaper">Found cheaper elsewhere</option>
                                    <option value="delivery_too_long">Delivery takes too long</option>
                                    <option value="payment_issue">Payment/Financial issue</option>
                                    <option value="duplicate_order">Duplicate order</option>
                                    <option value="other">Other reason</option>
                                </select>
                                {cancelError && (
                                    <p className="text-sm text-red-500 mt-1">{cancelError}</p>
                                )}
                            </div>

                            {/* Confirm Cancel */}
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-sm text-slate-500 mb-4">
                                    Are you sure you want to cancel this order? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            setShowCancelModal(false)
                                            setCancelOrder(null)
                                            setCancelReason('')
                                            setCancelError('')
                                        }}
                                        className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                    >
                                        Keep Order
                                    </button>
                                    <button 
                                        onClick={handleCancelOrder}
                                        disabled={!cancelReason}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm Cancellation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
