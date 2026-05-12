'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Search, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, Calendar, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import React from 'react'
import OrderTrackingWrapper from './OrderTrackingWrapper'

interface OrderTracking {
    id: string
    orderNumber: string
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    items: Array<{
        id: string
        name: string
        quantity: number
        price: number
        image?: string
    }>
    customerInfo: {
        name: string
        email: string
        phone: string
        address: string
        city: string
        country: string
    }
    shippingInfo?: {
        trackingNumber?: string
        carrier?: string
        estimatedDelivery?: string
        currentLocation?: {
            city: string
            country: string
            timestamp: string
        }
    }
    createdAt: string
    updatedAt: string
    totalAmount: number
}

const ORDER_STATUSES = {
    pending: { label: 'Order Confirmed', color: 'bg-blue-100 text-blue-700', icon: Clock },
    processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-amber-100 text-amber-700', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: XCircle }
}

function OrderTrackingContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [trackingNumber, setTrackingNumber] = useState('')
    const [orderData, setOrderData] = useState<OrderTracking | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const orderNumberFromUrl = searchParams.get('order') || searchParams.get('tracking')

    useEffect(() => {
        if (orderNumberFromUrl) {
            fetchOrderTracking(orderNumberFromUrl)
        }
    }, [orderNumberFromUrl])

    const fetchOrderTracking = async (orderNumber: string) => {
        try {
            setLoading(true)
            setError(null)

            // Mock data - replace with actual API call
            const mockOrderData: OrderTracking = {
                id: '1',
                orderNumber: orderNumber,
                status: 'shipped',
                items: [
                    {
                        id: '1',
                        name: 'Korean Beauty Serum',
                        quantity: 2,
                        price: 89.99,
                        image: '/api/placeholder/1'
                    },
                    {
                        id: '2',
                        name: 'Face Mask Collection',
                        quantity: 1,
                        price: 45.99,
                        image: '/api/placeholder/2'
                    }
                ],
                customerInfo: {
                    name: 'Sarah Johnson',
                    email: 'sarah.j@example.com',
                    phone: '+254-712-345-678',
                    address: '123 Beauty Street, Apt 4B',
                    city: 'Nairobi',
                    country: 'Kenya'
                },
                shippingInfo: {
                    trackingNumber: 'KGL202405150001',
                    carrier: 'Kenya Courier Service',
                    estimatedDelivery: 'May 15, 2026',
                    currentLocation: {
                        city: 'Nairobi',
                        country: 'Kenya',
                        timestamp: '2026-05-14T10:30:00Z'
                    }
                },
                createdAt: '2026-05-10T14:20:00Z',
                updatedAt: '2026-05-14T09:15:00Z',
                totalAmount: 225.97
            }

            setOrderData(mockOrderData)
        } catch (error) {
            console.error('Failed to fetch order tracking:', error)
            setError('Failed to load order information')
            toast.error('Unable to load order details')
        } finally {
            setLoading(false)
        }
    }

    const handleTrackingSearch = () => {
        if (!trackingNumber.trim()) {
            toast.error('Please enter a tracking number')
            return
        }

        router.push(`/order-tracking?order=${trackingNumber.trim()}`)
    }

    const handleRefresh = async () => {
        if (orderData) {
            await fetchOrderTracking(orderData.orderNumber)
            toast.success('Order information updated')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Tracking Error</h2>
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft size={20} />
                            Back to Shop
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Order Tracking</h1>
                    </div>
                </div>
            </div>

            {/* Tracking Search */}
            {!orderData && (
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Track Your Order</h2>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Number / Tracking ID
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter your order number (e.g., B2C-2026-0001)"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleTrackingSearch()
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleTrackingSearch}
                                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                            >
                                Track Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details */}
            {orderData && (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Order Status Header */}
                        <div className={`p-6 border-b ${
                            ORDER_STATUSES[orderData.status].color
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-full ${
                                        ORDER_STATUSES[orderData.status].color
                                    }`}>
                                        {React.createElement(ORDER_STATUSES[orderData.status].icon, { size: 24 })}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {ORDER_STATUSES[orderData.status].label}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Order #{orderData.orderNumber}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title="Refresh order status"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Order Info Grid */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Package size={16} />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">{orderData.customerInfo.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{orderData.customerInfo.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{orderData.customerInfo.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium text-gray-900">{orderData.customerInfo.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <p className="font-medium text-gray-900">
                                                {orderData.customerInfo.city}, {orderData.customerInfo.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Package size={16} />
                                        Order Items
                                    </h3>
                                    <div className="space-y-3">
                                        {orderData.items.map((item, index) => (
                                            <div key={item.id} className="flex gap-4 p-3 bg-white rounded-lg border border-gray-200">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                    <p className="text-sm text-gray-500">Price: ${item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            {orderData.shippingInfo && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <Truck size={16} />
                                        Shipping Information
                                    </h3>
                                    <div className="space-y-3">
                                        {orderData.shippingInfo.trackingNumber && (
                                            <div>
                                                <p className="text-sm text-blue-500">Tracking Number</p>
                                                <p className="font-medium text-blue-900">{orderData.shippingInfo.trackingNumber}</p>
                                            </div>
                                        )}
                                        {orderData.shippingInfo.carrier && (
                                            <div>
                                                <p className="text-sm text-blue-500">Carrier</p>
                                                <p className="font-medium text-blue-900">{orderData.shippingInfo.carrier}</p>
                                            </div>
                                        )}
                                        {orderData.shippingInfo.estimatedDelivery && (
                                            <div>
                                                <p className="text-sm text-blue-500">Estimated Delivery</p>
                                                <p className="font-medium text-blue-900">{orderData.shippingInfo.estimatedDelivery}</p>
                                            </div>
                                        )}
                                        {orderData.shippingInfo.currentLocation && (
                                            <div>
                                                <p className="text-sm text-blue-500">Current Location</p>
                                                <p className="font-medium text-blue-900">
                                                    {orderData.shippingInfo.currentLocation.city}, {orderData.shippingInfo.currentLocation.country}
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Updated: {new Date(orderData.shippingInfo.currentLocation.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order Timeline */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Order Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex gap-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order Confirmed</p>
                                            <p className="text-sm text-gray-500">{new Date(orderData.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {orderData.status === 'processing' && (
                                        <div className="flex gap-4">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Processing</p>
                                                <p className="text-sm text-gray-500">Your order is being prepared for shipment</p>
                                            </div>
                                        </div>
                                    )}
                                    {orderData.status === 'shipped' && (
                                        <div className="flex gap-4">
                                            <div className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0"></div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Shipped</p>
                                                <p className="text-sm text-gray-500">Your order has been shipped and is on its way</p>
                                            </div>
                                        </div>
                                    )}
                                    {orderData.status === 'delivered' && (
                                        <div className="flex gap-4">
                                            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Delivered</p>
                                                <p className="text-sm text-gray-500">Your order has been successfully delivered</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                                <p className="text-sm text-gray-500">
                                    Placed on {new Date(orderData.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-gray-900">${orderData.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        Paid
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Main page component with Suspense wrapper to handle useSearchParams
export default function OrderTrackingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading order tracking...</span>
                </div>
            </div>
        }>
            <OrderTrackingContent />
        </Suspense>
    )
}
