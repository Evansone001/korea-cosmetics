'use client'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { PackageIcon, DollarSignIcon, ShoppingCartIcon, UsersIcon, Store, Clock, AlertCircle, ArrowRight, Bell, Loader2, MessageSquare } from 'lucide-react'
import { apiClient, OrderStatsResponse, CustomerStatsResponse, DashboardMetricsResponse } from '@/lib/api-client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import AdminComments from '@/components/store/AdminComments'

interface StoreData {
    id: string
    name: string
    status: string
    is_active: boolean
    rejection_reason?: string
    admin_comments?: string
    created_at: string
    customer_type?: string
}

export default function StoreDashboard() {
    const products = useAppSelector(state => state.product.list)
    const { isAuthenticated, authChecked } = useAppSelector(state => state?.auth || { isAuthenticated: false, authChecked: false })
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
    
    // Product visibility state
    const [showOutOfStock, setShowOutOfStock] = useState(true)
    const [autoFeatureNew, setAutoFeatureNew] = useState(true)
    const [hideDiscontinued, setHideDiscontinued] = useState(true)
    
    // Fulfillment action loading state
    const [fulfillmentLoading, setFulfillmentLoading] = useState<string | null>(null)
    
    // Store products state
    const [storeProducts, setStoreProducts] = useState<any[]>([])
    const [productsLoading, setProductsLoading] = useState(false)

    useEffect(() => {
        if (authChecked && isAuthenticated) {
            checkStoreStatus()
        }
    }, [authChecked, isAuthenticated])

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
            console.log('Checking store status...')
            const response: any = await apiClient.getMyStore()
            
            console.log('Store API response:', response)

            if (response && response.store) {
                console.log('Store found:', response.store.name, 'Status:', response.store.status)
                setStore(response.store)
                setStoreError(null)

                // Only fetch dashboard data if store is active
                if (response.store.status === 'active') {
                    fetchDashboardData(response.store)
                    // Load store products with B2C/B2B filtering
                    loadStoreProducts()
                }
            } else if (response && response.error) {
                console.log('Store API error:', response.error)
                setStore(null)
                setStoreError(response.error)
            } else {
                console.log('No store found in response')
                // No store found
                setStore(null)
                setStoreError(null)
            }
        } catch (error: any) {
            console.error('Store check error:', error)
            console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            })
            setStore(null)
            setStoreError(error?.response?.data?.error || error?.message || 'Unable to load store information. Please try again.')
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
            toast.error('Unable to load dashboard data. Please try again.')
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
            toast.error('Unable to load notifications. Please try again.')
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
            toast.error('Unable to mark notification as read. Please try again.')
        }
    }

    const loadStoreProducts = async () => {
        try {
            if (!store?.id) {
                return
            }

            setProductsLoading(true)
            
            // Get visibility settings
            const settings = {
                showOutOfStock,
                autoFeatureNew,
                hideDiscontinued
            }
            
            // Get filtered products based on store's customer type and visibility settings
            const response = await apiClient.getFilteredProducts(store.id)
            
            if (response?.products) {
                setStoreProducts(response.products)
                console.log(`Loaded ${response.products.length} products for ${store.customer_type || 'B2C'} store`)
            }
            
        } catch (error: any) {
            console.error('Failed to load store products:', error)
            const errorMessage = error?.response?.data?.error || error?.message || 'Unable to load products. Please try again.'
            toast.error(errorMessage)
        } finally {
            setProductsLoading(false)
        }
    }

    const handleBulkVisibilityAction = async (action: string) => {
        try {
            if (!store?.id) {
                toast.error('Please create a store first to manage product visibility')
                return
            }

            console.log(`Performing bulk visibility action: ${action}`)
            
            // Call API to perform bulk visibility action
            const response = await apiClient.performBulkVisibilityAction(store.id, action)
            
            if (response?.products_updated) {
                toast.success(`${action} completed for ${response.products_updated} products`)
            } else {
                toast.success(`${action} action completed successfully`)
            }
            
            // Refresh products to apply changes
            await loadStoreProducts()
            
        } catch (error: any) {
            console.error('Failed to perform bulk action:', error)
            const errorMessage = error?.response?.data?.error || error?.message || `Unable to ${action.toLowerCase()} products. Please try again.`
            toast.error(errorMessage)
        }
    }

    const handleVisibilitySettingChange = async (setting: string, value: boolean) => {
        try {
            if (!store?.id) {
                toast.error('Please create a store first to manage visibility settings')
                return
            }

            console.log(`Updating visibility setting: ${setting} = ${value}`)
            
            // Update local state first
            switch (setting) {
                case 'showOutOfStock':
                    setShowOutOfStock(value)
                    break
                case 'autoFeatureNew':
                    setAutoFeatureNew(value)
                    break
                case 'hideDiscontinued':
                    setHideDiscontinued(value)
                    break
            }
            
            // Call API to update store settings
            const settings = {
                showOutOfStock,
                autoFeatureNew,
                hideDiscontinued,
                [setting]: value
            }
            
            await apiClient.updateVisibilitySettings(store.id, settings)
            toast.success(`Visibility setting updated`)
            
            // Refresh products to apply new visibility settings
            await loadStoreProducts()
            
        } catch (error: any) {
            console.error('Failed to update visibility setting:', error)
            const errorMessage = error?.response?.data?.error || error?.message || 'Unable to update visibility setting. Please try again.'
            toast.error(errorMessage)
        }
    }

    
    const statCards = [
        {
            title: 'Total Products',
            value: dashboardMetrics?.metrics?.total_products?.current || 0,
            icon: PackageIcon,
            bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
            change: dashboardMetrics?.metrics?.total_products?.change_label || 'No data'
        },
        {
            title: 'Total Orders',
            value: dashboardMetrics?.metrics?.total_orders?.current_month || 0,
            icon: ShoppingCartIcon,
            bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
            change: dashboardMetrics?.metrics?.total_orders?.change_label || 'No data'
        },
        {
            title: 'Total Revenue',
            value: `KES ${(dashboardMetrics?.metrics?.total_revenue?.current_month || 0).toLocaleString()}`,
            icon: DollarSignIcon,
            bgColor: 'bg-gradient-to-br from-pink-600 to-rose-600',
            change: dashboardMetrics?.metrics?.total_revenue?.change_label || 'No data'
        },
        {
            title: 'Total Customers',
            value: dashboardMetrics?.metrics?.total_customers?.current_month || 0,
            icon: UsersIcon,
            bgColor: 'bg-gradient-to-br from-rose-400 to-pink-500',
            change: dashboardMetrics?.metrics?.total_customers?.change_label || 'No data'
        }
    ]

    // Loading state
    if (storeLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin" size={32} />
            </div>
        )
    }

    // No Store - Show CTA to create store or error message
    if (!store) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    {storeError ? (
                        <>
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                Store Access Error
                            </h2>
                            <p className="text-red-600 mb-6 bg-red-50 p-4 rounded-lg">
                                {storeError}
                            </p>
                            <div className="space-y-3 text-sm text-slate-600 mb-8">
                                <p><strong>Possible causes:</strong></p>
                                <ul className="text-left space-y-1">
                                    <li>• Your session has expired - try logging out and back in</li>
                                    <li>• You don&apos;t have seller permissions</li>
                                    <li>• Store data is missing or corrupted</li>
                                    <li>• Network connectivity issues</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Store className="w-10 h-10 text-pink-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                Create Your Store
                            </h2>
                            <p className="text-slate-600 mb-2">
                                You don&apos;t have a store yet. Set up your store to start selling on KoreaCosmetics&apos; Hub.
                            </p>
                            <p className="text-sm text-slate-500 mb-8">
                                Your application will be reviewed by our admin team before activation.
                            </p>
                        </>
                    )}
                    <Link
                        href="/create-store"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                    >
                        {storeError ? 'Try Creating New Store' : 'Create Store'}
                        <ArrowRight size={20} />
                    </Link>
                    <p className="mt-6 text-sm text-slate-400">
                        Need help? <Link href="/contact" className="text-pink-600 hover:underline">Contact support</Link>
                    </p>
                </div>
            </div>
        )
    }

    const handleFulfillmentAction = async (action: string) => {
        try {
            if (!store?.id) {
                toast.error('Please create a store first to manage fulfillment settings')
                return
            }

            setFulfillmentLoading(action)
            console.log(`Performing fulfillment action: ${action}`)
            
            let response
            
            // Call actual API endpoints for fulfillment actions
            switch (action) {
                case 'generate-packing-slips':
                    response = await apiClient.generatePackingSlips(store.id)
                    // Handle file download - response is already a Blob
                    if (response instanceof Blob) {
                        const url = window.URL.createObjectURL(response)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `packing-slips-${store.name}-${new Date().toISOString().split('T')[0]}.pdf`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                        toast.success('Packing slips downloaded successfully')
                    }
                    break
                    
                case 'print-shipping-labels':
                    response = await apiClient.printShippingLabels(store.id)
                    // Handle file download - response is already a Blob
                    if (response instanceof Blob) {
                        const url = window.URL.createObjectURL(response)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `shipping-labels-${store.name}-${new Date().toISOString().split('T')[0]}.pdf`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                        toast.success('Shipping labels downloaded successfully')
                    }
                    break
                    
                case 'quality-check':
                    response = await apiClient.performQualityCheck(store.id)
                    toast.success('Quality check completed')
                    break
                    
                case 'send-order-confirmation':
                    response = await apiClient.sendOrderConfirmation(store.id)
                    toast.success('Order confirmation sent to customer')
                    break
                    
                case 'send-shipping-update':
                    response = await apiClient.sendShippingUpdate(store.id)
                    toast.success('Shipping update sent to customer')
                    break
                    
                case 'send-delivery-notification':
                    response = await apiClient.sendDeliveryNotification(store.id)
                    toast.success('Delivery notification sent to customer')
                    break
                    
                default:
                    toast.error('This action is not available. Please contact support.')
            }
            
            checkStoreStatus() // Refresh store data
        } catch (error: any) {
            console.error('Failed to perform fulfillment action:', error)
            const errorMessage = error?.response?.data?.error || error?.message || `Unable to complete this action. Please try again.`
            toast.error(errorMessage)
        } finally {
            setFulfillmentLoading(null)
        }
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
                </div>
            </div>

            {/* Admin Comments Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                    Admin Feedback & Comments
                </h2>
                <AdminComments storeId={store?.id} />
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

            {/* Product Visibility Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Visibility</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-slate-700 mb-3">Bulk Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleBulkVisibilityAction('Set All Products Active')}
                                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                            >
                                Set All Products Active
                            </button>
                            <button 
                                onClick={() => handleBulkVisibilityAction('Hide Out of Stock')}
                                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                                Hide Out of Stock
                            </button>
                            <button 
                                onClick={() => handleBulkVisibilityAction('Feature Top Products')}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Feature Top Products
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-700 mb-3">Visibility Settings</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">Show out of stock</label>
                                <input 
                                    type="checkbox" 
                                    checked={showOutOfStock}
                                    onChange={(e) => handleVisibilitySettingChange('showOutOfStock', e.target.checked)}
                                    className="rounded border-slate-300" 
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">Auto-feature new</label>
                                <input 
                                    type="checkbox" 
                                    checked={autoFeatureNew}
                                    onChange={(e) => handleVisibilitySettingChange('autoFeatureNew', e.target.checked)}
                                    className="rounded border-slate-300" 
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">Hide discontinued</label>
                                <input 
                                    type="checkbox" 
                                    checked={hideDiscontinued}
                                    onChange={(e) => handleVisibilitySettingChange('hideDiscontinued', e.target.checked)}
                                    className="rounded border-slate-300" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fulfillment Tools */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Fulfillment Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-slate-700 mb-3">Order Preparation</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleFulfillmentAction('generate-packing-slips')}
                                disabled={fulfillmentLoading === 'generate-packing-slips'}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {fulfillmentLoading === 'generate-packing-slips' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Packing Slips'
                                )}
                            </button>
                            <button 
                                onClick={() => handleFulfillmentAction('print-shipping-labels')}
                                disabled={fulfillmentLoading === 'print-shipping-labels'}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {fulfillmentLoading === 'print-shipping-labels' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Print Shipping Labels'
                                )}
                            </button>
                            <button 
                                onClick={() => handleFulfillmentAction('quality-check')}
                                disabled={fulfillmentLoading === 'quality-check'}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {fulfillmentLoading === 'quality-check' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Quality Check'
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-700 mb-3">Customer Communication</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleFulfillmentAction('send-order-confirmation')}
                                disabled={fulfillmentLoading === 'send-order-confirmation'}
                                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-pink-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {fulfillmentLoading === 'send-order-confirmation' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Order Confirmation'
                                )}
                            </button>
                            <button 
                                onClick={() => handleFulfillmentAction('send-shipping-update')}
                                disabled={fulfillmentLoading === 'send-shipping-update'}
                                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {fulfillmentLoading === 'send-shipping-update' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Shipping Update'
                                )}
                            </button>
                            <button 
                                onClick={() => handleFulfillmentAction('send-delivery-notification')}
                                disabled={fulfillmentLoading === 'send-delivery-notification'}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {fulfillmentLoading === 'send-delivery-notification' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Delivery Notification'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* B2C Filtered Products */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Your Products ({store?.customer_type || 'B2C'})
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        {productsLoading && (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Loading...
                            </>
                        )}
                        {!productsLoading && (
                            <>
                                <span>{storeProducts.length} products</span>
                                {store?.customer_type === 'B2C' && (
                                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                                        B2C Store
                                    </span>
                                )}
                                {store?.customer_type === 'B2B' && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        B2B Store
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
                
                {storeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {storeProducts.slice(0, 6).map((product) => (
                            <div key={product.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-slate-900 text-sm truncate flex-1">
                                        {product.name}
                                    </h3>
                                    {product.featured && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs ml-2">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-pink-600">
                                        ${product.price}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            product.stock_quantity > 0 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            product.visibility_status === 'ACTIVE' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-grey-100 text-grey-700'
                                        }`}>
                                            {product.visibility_status}
                                        </span>
                                    </div>
                                </div>
                                {product.visibility_notes && (
                                    <p className="text-xs text-slate-400 mt-2 italic">
                                        Note: {product.visibility_notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <PackageIcon size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">
                            {productsLoading 
                                ? 'Loading products...' 
                                : store?.customer_type === 'B2C' 
                                    ? 'No B2C products available. Contact admin to add products for your store.'
                                    : 'No B2B products available. Contact admin to add wholesale products for your store.'
                            }
                        </p>
                    </div>
                )}
                
                {storeProducts.length > 6 && (
                    <div className="mt-4 text-center">
                        <Link 
                            href="/store/catalog" 
                            className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                        >
                            View all {storeProducts.length} products →
                        </Link>
                    </div>
                )}
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
