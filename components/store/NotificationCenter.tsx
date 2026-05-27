'use client'
import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, X, Clock, AlertCircle, Package, Store, UserCheck, ShoppingCart, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Notification {
    id: string
    user_id: string
    message: string
    type: string
    created_at: string
    read: boolean
}

interface NotificationCenterProps {
    isOpen: boolean
    onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response: any = await apiClient.request('/api/user/notifications?limit=20', {
                method: 'GET'
            })
            setNotifications(response.notifications || [])
            
            // Fetch unread count
            const unreadResponse: any = await apiClient.request('/api/user/notifications/unread-count', {
                method: 'GET'
            })
            setUnreadCount(unreadResponse.unread_count || 0)
        } catch (err: any) {
            console.error('Failed to fetch notifications:', err)
            setError('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const markAsRead = async (notificationId: string) => {
        try {
            await apiClient.request(`/api/user/notifications/${notificationId}/mark-read`, {
                method: 'PUT'
            })
            
            // Update local state
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            ))
            setUnreadCount(Math.max(0, unreadCount - 1))
        } catch (err) {
            console.error('Failed to mark notification as read:', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await apiClient.request('/api/user/notifications/mark-all-read', {
                method: 'PUT'
            })
            
            // Update local state
            setNotifications(notifications.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await apiClient.request(`/api/user/notifications/${notificationId}`, {
                method: 'DELETE'
            })
            
            // Update local state
            setNotifications(notifications.filter(n => n.id !== notificationId))
            if (!notifications.find(n => n.id === notificationId)?.read) {
                setUnreadCount(Math.max(0, unreadCount - 1))
            }
        } catch (err) {
            console.error('Failed to delete notification:', err)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reseller_approved':
                return <UserCheck className="w-5 h-5 text-green-600" />
            case 'reseller_rejected':
                return <X className="w-5 h-5 text-red-600" />
            case 'store_approved':
                return <Store className="w-5 h-5 text-green-600" />
            case 'store_rejected':
                return <X className="w-5 h-5 text-red-600" />
            case 'order_shipped':
                return <Package className="w-5 h-5 text-blue-600" />
            case 'order_delivered':
                return <Check className="w-5 h-5 text-green-600" />
            case 'order_cancelled':
                return <X className="w-5 h-5 text-red-600" />
            case 'order_refunded':
                return <RefreshCw className="w-5 h-5 text-orange-600" />
            default:
                return <Bell className="w-5 h-5 text-gray-600" />
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'reseller_approved':
            case 'store_approved':
            case 'order_delivered':
                return 'bg-green-50 border-green-200'
            case 'reseller_rejected':
            case 'store_rejected':
            case 'order_cancelled':
                return 'bg-red-50 border-red-200'
            case 'order_shipped':
                return 'bg-blue-50 border-blue-200'
            case 'order_refunded':
                return 'bg-orange-50 border-orange-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[80vh] flex flex-col pointer-events-auto">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-gray-700" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-600">
                            {error}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.read ? 'bg-blue-50/50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4 text-gray-500" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={fetchNotifications}
                            className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 py-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
