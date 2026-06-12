'use client'
import Link from "next/link"
import Image from "next/image"
import { Bell, LogOut, User, CheckCircle, XCircle, ShoppingBag, Store, AlertTriangle, Check, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"
import { assets } from "@/assets/assets"

interface UserNotification {
  id: string
  message: string
  type: string
  created_at: string
  read: boolean
}

interface PendingCounts {
  total: number
  pending_reseller_applications: number
  pending_stores: number
}

const notificationIcon = (type: string) => {
  switch (type) {
    case 'reseller_approved': return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
    case 'reseller_rejected': return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    case 'store_approved': return <Store className="w-4 h-4 text-green-500 flex-shrink-0" />
    case 'store_rejected': return <Store className="w-4 h-4 text-red-500 flex-shrink-0" />
    case 'order_shipped':
    case 'order_delivered':
    case 'order_cancelled':
    case 'order_refunded': return <ShoppingBag className="w-4 h-4 text-blue-500 flex-shrink-0" />
    case 'wholesale_order_placed': return <ShoppingBag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
    case 'wholesale_order_approved': return <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
    case 'wholesale_order_rejected': return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    case 'wholesale_order_shipped': return <ShoppingBag className="w-4 h-4 text-sky-500 flex-shrink-0" />
    case 'wholesale_order_delivered': return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
    case 'wholesale_order_cancelled': return <XCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
    default: return <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0" />
  }
}

const notificationLink = (type: string): string => {
  switch (type) {
    case 'reseller_approved':
    case 'reseller_rejected': return '/admin/approve'
    case 'store_approved':
    case 'store_rejected': return '/admin/approve'
    case 'order_shipped':
    case 'order_delivered':
    case 'order_cancelled':
    case 'order_refunded': return '/admin/orders'
    case 'wholesale_order_placed':
    case 'wholesale_order_approved':
    case 'wholesale_order_rejected':
    case 'wholesale_order_shipped':
    case 'wholesale_order_delivered':
    case 'wholesale_order_cancelled': return '/admin/wholesale-orders'
    default: return '/admin'
  }
}

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const AdminNavbar = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state?.auth || { user: null })
  const [pendingCounts, setPendingCounts] = useState<PendingCounts | null>(null)
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchPendingCounts = async () => {
    try {
      const res = await fetch('/api/admin/pending-counts', { credentials: 'include' })
      if (res.ok) setPendingCounts(await res.json())
    } catch { /* silent */ }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/user/notifications?limit=20&unread_only=false', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch { /* silent */ }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/user/notifications/unread-count', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUnreadNotifCount(data.unread_count ?? 0)
      }
    } catch { /* silent */ }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/user/notifications/mark-all-read', { method: 'PUT', credentials: 'include' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadNotifCount(0)
    } catch { /* silent */ }
  }

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/user/notifications/${id}/mark-read`, { method: 'PUT', credentials: 'include' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadNotifCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }


  useEffect(() => {
    fetchPendingCounts()
    fetchNotifications()
    fetchUnreadCount()
    const interval = setInterval(() => {
      fetchPendingCounts()
      fetchNotifications()
      fetchUnreadCount()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' })
    dispatch(logout())
    router.push('/login')
  }

  const pendingTotal = pendingCounts?.total ?? 0
  const badgeCount = pendingTotal + unreadNotifCount

  return (
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-pink-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex-shrink-0" style={{ zIndex: 100 }}>
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 sm:gap-2 group absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none">
          <div className="relative w-10 h-10">
            <Image src={assets.korea_logo} alt="Korea Cosmetics Hub" fill className="object-cover rounded-lg" />
          </div>
          <div className="hidden sm:block relative">
            <span className="text-xl font-bold tracking-tight text-slate-800">KoreaCosmetics'</span>
            <span className="absolute -right-8 -top-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm">
              Admin
            </span>
          </div>
        </Link>

        <div className="w-10 sm:hidden"></div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">

          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef} style={{ zIndex: 200 }}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="relative p-1.5 sm:p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>

            {/* Dropdown — rendered in a fixed portal-like position */}
            {showDropdown && (
              <div
                className="fixed right-4 top-16 w-80 bg-white rounded-xl shadow-2xl border border-pink-100 overflow-hidden"
                style={{ zIndex: 9999 }}
              >
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`flex-1 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'alerts' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Alerts
                    {pendingTotal > 0 && (
                      <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingTotal}</span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex-1 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'notifications' ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Notifications
                    {unreadNotifCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifCount}</span>
                    )}
                  </button>
                </div>

                {/* Alerts Tab */}
                {activeTab === 'alerts' && (
                  <div>
                    {pendingTotal === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
                        All caught up!
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                        {(pendingCounts?.pending_reseller_applications ?? 0) > 0 && (
                          <Link
                            href="/admin/approve"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-pink-50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-pink-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700">Reseller Applications</p>
                              <p className="text-xs text-slate-400">Awaiting admin review</p>
                            </div>
                            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                              {pendingCounts?.pending_reseller_applications}
                            </span>
                          </Link>
                        )}
                        {(pendingCounts?.pending_stores ?? 0) > 0 && (
                          <Link
                            href="/admin/approve"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                              <Store className="w-4 h-4 text-rose-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700">Store Applications</p>
                              <p className="text-xs text-slate-400">Awaiting approval</p>
                            </div>
                            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                              {pendingCounts?.pending_stores}
                            </span>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    {/* Header with mark all read */}
                    {unreadNotifCount > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50 bg-slate-50/50">
                        <span className="text-xs text-slate-500">{unreadNotifCount} unread</span>
                        <button
                          onClick={markAllRead}
                          className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Mark all read
                        </button>
                      </div>
                    )}

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        No notifications yet
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                        {notifications.map(notif => (
                          <Link
                            key={notif.id}
                            href={notificationLink(notif.type)}
                            onClick={() => {
                              if (!notif.read) markOneRead(notif.id)
                              setShowDropdown(false)
                            }}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors ${notif.read ? 'bg-white hover:bg-slate-50' : 'bg-pink-50/40 hover:bg-pink-50'}`}
                          >
                            <div className="mt-0.5">
                              {notificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(notif.created_at)}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-1.5" />
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 md:pl-4 border-l border-pink-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'Admin'}</p>
              <p className="text-xs text-pink-600">{user?.email || ''}</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
