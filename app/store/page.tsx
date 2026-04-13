'use client'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { PackageIcon, DollarSignIcon, ShoppingCartIcon, UsersIcon, Store, Clock, AlertCircle, ArrowRight, Bell } from 'lucide-react'
import { apiClient, OrderStatsResponse, CustomerStatsResponse, DashboardMetricsResponse } from '@/lib/api-client'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface StoreData {
    id: string
    name: string
    status: string
    is_active: boolean
    rejection_reason?: string
    admin_comments?: string
    created_at: string
}

export default function StoreDashboard() {
    const products = useAppSelector(state => state.product.list)
    const [store, setStore] = useState<StoreData | null>(null)
    const [storeLoading, setStoreLoading] = useState(true)
    const [storeError, setStoreError] = useState<string | null>(null)
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetricsResponse | null>(null)
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [lowStockAlerts, setLowStockAlerts] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

    useEffect(() => {
        checkStoreStatus()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showNotificationDropdown) {
                setShowNotificationDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showNotificationDropdown])

    const checkStoreStatus = async () => {
        try {
            setStoreLoading(true)
            const response: any = await apiClient.getMyStore()

            if (response && response.store) {
                setStore(response.store)
                setStoreError(null)

                // Only fetch dashboard data if store is active
                if (response.store.status === 'active' && response.store.is_active) {
                    fetchDashboardData(response.store)
                }
            } else {
                // No store found
                setStore(null)
                setStoreError(null)
            }
        } catch (error: any) {
            console.log('Store check error:', error?.message || 'Unknown error')
            setStore(null)
            setStoreError(error?.message || 'Error checking store status')
        } finally {
            setStoreLoading(false)
            setLoading(false)
        }
    }

    const fetchDashboardData = async (storeData: StoreData) => {
        try {
            setLoading(true)

            // Make all API calls in parallel for faster loading
            const [metrics, inventory, inventorySummary] = await Promise.all([
                apiClient.getStoreDashboardMetrics(storeData.id).catch(err => {
                    console.error('Failed to fetch metrics:', err)
                    return null
                }),
                apiClient.getInventory({ limit: 8 }).catch(err => {
                    console.error('Failed to fetch inventory:', err)
                    return { inventory: [] }
                }),
                apiClient.getInventorySummary().catch(err => {
                    console.error('Failed to fetch inventory summary:', err)
                    return { low_stock: 0 }
                })
            ])

            // Set state with fetched data
            if (metrics) {
                setDashboardMetrics(metrics)
                setRecentOrders(metrics.recent_orders || [])
            }

            if (inventory) {
                setTopProducts(inventory.inventory || [])
            }

            if (inventorySummary) {
                setLowStockAlerts(inventorySummary.low_stock || 0)
            }

            // Fetch notifications (non-blocking)
            fetchNotifications(storeData.id)
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const fetchNotifications = async (storeId: string) => {
        try {
            console.log('Fetching notifications for store:', storeId)

            // Fetch both store and product notifications
            const [storeNotifResponse, productNotifResponse]: any[] = await Promise.all([
                apiClient.getStoreNotifications(storeId).catch(err => {
                    console.error('Failed to fetch store notifications:', err)
                    return { notifications: [] }
                }),
                apiClient.getProductNotifications().catch(err => {
                    console.error('Failed to fetch product notifications:', err)
                    return { notifications: [] }
                })
            ])

            console.log('Store notifications:', storeNotifResponse?.notifications?.length || 0)
            console.log('Product notifications:', productNotifResponse?.notifications?.length || 0)

            const allNotifications = [
                ...(storeNotifResponse.notifications || []).map((n: any) => ({ ...n, type: 'store' })),
                ...(productNotifResponse.notifications || []).map((n: any) => ({ ...n, type: 'product' }))
            ].sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())

            console.log('Total notifications after combining:', allNotifications.length)

            setNotifications(allNotifications)
            setUnreadCount(allNotifications.filter((n: any) => !n.read).length || 0)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            toast.error('Failed to load notifications')
        }
    }

    const handleMarkAsRead = async (notificationId: string, notificationType?: string) => {
        try {
            if (!store?.id) {
                console.log('No store ID available for marking notification as read')
                return
            }

            console.log('Marking notification as read:', notificationId, 'type:', notificationType)

            if (notificationType === 'product') {
                await apiClient.markNotificationRead(notificationId)
            } else {
                await apiClient.markNotificationAsRead(store.id, notificationId)
            }
            fetchNotifications(store.id)
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
            toast.error('Failed to mark notification as read')
        }
    }

    const statCards = [
        {
            title: 'Total Products',
            value: dashboardMetrics?.metrics.total_products.current || 0,
            icon: PackageIcon,
            bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
            change: dashboardMetrics?.metrics.total_products.change_label || 'No data'
        },
        {
            title: 'Total Orders',
            value: dashboardMetrics?.metrics.total_orders.current_month || 0,
            icon: ShoppingCartIcon,
            bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
            change: dashboardMetrics?.metrics.total_orders.change_label || 'No data'
        },
        {
            title: 'Total Revenue',
            value: `$${(dashboardMetrics?.metrics.total_revenue.current_month || 0).toLocaleString()}`,
            icon: DollarSignIcon,
            bgColor: 'bg-gradient-to-br from-pink-600 to-rose-600',
            change: dashboardMetrics?.metrics.total_revenue.change_label || 'No data'
        },
        {
            title: 'Total Customers',
            value: dashboardMetrics?.metrics.total_customers.current_month || 0,
            icon: UsersIcon,
            bgColor: 'bg-gradient-to-br from-rose-400 to-pink-500',
            change: dashboardMetrics?.metrics.total_customers.change_label || 'No data'
        }
    ]

    // Loading state
    if (storeLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            </div>
        )
    }

    // No Store - Show CTA to create store
    if (!store) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-pink-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        Create Your Store
                    </h2>
                    <p className="text-slate-600 mb-2">
                        You don&apos;t have a store yet. Set up your store to start selling on KoreaCosmetics' Hub.
                    </p>
                    <p className="text-sm text-slate-500 mb-8">
                        Your application will be reviewed by our admin team before activation.
                    </p>
                    <Link
                        href="/create-store"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Create Store
                        <ArrowRight size={20} />
                    </Link>
                    <p className="mt-6 text-sm text-slate-400">
                        Need help? <Link href="/contact" className="text-pink-600 hover:underline">Contact support</Link>
                    </p>
                </div>
            </div>
        )
    }

    // Store Pending Approval
    if (store.status === 'pending') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        Store Under Review
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Your store application has been submitted and is awaiting admin approval.
                    </p>
                    
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-500">Store Name:</span>
                            <span className="text-sm font-medium text-slate-900">{store.name}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-500">Submitted:</span>
                            <span className="text-sm font-medium text-slate-900">
                                {new Date(store.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-500">Status:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <Clock size={12} />
                                Pending
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-sm text-slate-500">
                        You&apos;ll be notified via email once approved. 
                        <Link href="/contact" className="text-pink-600 hover:underline ml-1">Contact support</Link> for questions.
                    </p>
                </div>
            </div>
        )
    }

    // Store Rejected
    if (store.status === 'inactive' && store.rejection_reason) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        Store Application Rejected
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Unfortunately, your store application was not approved.
                    </p>
                    
                    <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                        <p className="text-sm text-red-600">{store.rejection_reason}</p>
                        {store.admin_comments && (
                            <>
                                <p className="text-sm font-medium text-red-800 mt-3 mb-1">Admin Comments:</p>
                                <p className="text-sm text-red-600">{store.admin_comments}</p>
                            </>
                        )}
                    </div>
                    
                    <Link
                        href="/create-store"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Edit & Resubmit
                        <ArrowRight size={20} />
                    </Link>
                    <p className="mt-4 text-sm text-slate-400">
                        <Link href="/contact" className="text-pink-600 hover:underline">Contact support</Link> for assistance
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Store Dashboard</h1>
                    <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">Welcome back! Here's an overview of your store performance.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {lowStockAlerts > 0 && (
                        <div className="hidden sm:flex bg-amber-50 border border-amber-200 rounded-lg px-3 sm:px-4 py-2 items-center gap-2">
                            <span className="text-amber-600">⚠️</span>
                            <span className="text-amber-700 font-medium text-sm">{lowStockAlerts} items low on stock</span>
                        </div>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                            className="relative p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Bell size={22} className="text-slate-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotificationDropdown && (
                            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.slice(0, 10).map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                    !notification.read ? 'bg-blue-50' : ''
                                                }`}
                                                onClick={() => {
                                                    if (!notification.read) {
                                                        handleMarkAsRead(notification.id, notification.type)
                                                    }
                                                    setShowNotificationDropdown(false)
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        notification.type === 'store' || notification.type === 'status_change'
                                                            ? 'bg-green-100 text-green-600'
                                                            : notification.type === 'product' || notification.type === 'approved'
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : notification.type === 'rejected'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                        {notification.type === 'store' || notification.type === 'status_change' ? (
                                                            <Store size={16} />
                                                        ) : notification.type === 'product' || notification.type === 'approved' ? (
                                                            <PackageIcon size={16} />
                                                        ) : notification.type === 'rejected' ? (
                                                            <AlertCircle size={16} />
                                                        ) : (
                                                            <Bell size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-900 line-clamp-2">{notification.message}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {new Date(notification.created_at || notification.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {notifications.length > 10 && (
                                    <div className="p-3 border-t border-slate-200 text-center">
                                        <button
                                            onClick={() => setShowNotificationDropdown(false)}
                                            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                                        >
                                            View all notifications
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                <p className="text-sm text-pink-600 mt-2">{stat.change}</p>
                            </div>
                            <div className={`${stat.bgColor} p-3 rounded-xl shadow-lg`}>
                                <stat.icon size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                                    !notification.read
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-slate-50 border-slate-200'
                                }`}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id, notification.type)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        notification.type === 'store' || notification.type === 'status_change'
                                            ? 'bg-green-100 text-green-600'
                                            : notification.type === 'product' || notification.type === 'approved'
                                            ? 'bg-blue-100 text-blue-600'
                                            : notification.type === 'rejected'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {notification.type === 'store' || notification.type === 'status_change' ? (
                                            <Store size={16} />
                                        ) : notification.type === 'product' || notification.type === 'approved' ? (
                                            <PackageIcon size={16} />
                                        ) : notification.type === 'rejected' ? (
                                            <AlertCircle size={16} />
                                        ) : (
                                            <Bell size={16} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-900">{notification.message}</p>
                                        {notification.rejection_reason && (
                                            <p className="text-xs text-slate-600 mt-1">{notification.rejection_reason}</p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">
                                            {new Date(notification.created_at || notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
                    <div className="space-y-3">
                        {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                            <div key={order.id || index} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                                <div>
                                    <p className="font-medium text-slate-900">#{order.id?.slice(-6) || 'N/A'}</p>
                                    <p className="text-sm text-slate-600">{order.customer?.name || 'Unknown'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">${order.total?.toFixed(2) || '0.00'}</p>
                                    <p className={`text-sm ${
                                        order.status === 'delivered' ? 'text-green-600' :
                                        order.status === 'shipped' ? 'text-purple-600' :
                                        order.status === 'processing' ? 'text-blue-600' :
                                        'text-amber-600'
                                    }`}>
                                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Products</h2>
                    <div className="space-y-3">
                        {topProducts.slice(0, 4).map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{product.product_name}</p>
                                        <p className="text-sm text-pink-600">{product.category || 'Uncategorized'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">${product.price}</p>
                                    <p className="text-sm text-slate-600">{product.sold_quantity || 0} sold</p>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <p>No products yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <PackageIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Add Product</p>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <ShoppingCartIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">View Orders</p>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <DollarSignIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Analytics</p>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <UsersIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Customers</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
