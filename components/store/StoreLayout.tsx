'use client'
import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import NotificationCenter from "./NotificationCenter"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setUser, setAuthenticated } from "@/lib/features/auth/authSlice"
import toast from "react-hot-toast"
import { apiClient } from "@/lib/api-client"

interface StoreLayoutProps {
  children: ReactNode
}

interface StoreInfo {
  id: string
  name: string
  username: string
  logo: string | null
  status: string
  rejection_reason?: string | null
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false })
  const [localLoading, setLocalLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const res: any = await apiClient.request('/api/user/notifications/unread-count', { method: 'GET' })
      setUnreadCount(res?.unread_count ?? 0)
    } catch {
      // silently ignore
    }
  }

  const fetchStoreInfo = async () => {
    try {
      const response: any = await apiClient.getMyStore()
      if (response && response.store) {
        setStoreInfo({
          id: response.store.id,
          name: response.store.name,
          username: response.store.username || response.store.id,
          logo: response.store.logo || null,
          status: response.store.status || 'pending',
          rejection_reason: response.store.rejection_reason || null,
        })
      } else {
        // User has seller role but no store - redirect to create store
        console.log('[StoreLayout] User has no store, redirecting to create store')
        router.push('/create-store')
      }
    } catch (error: any) {
      console.log('[StoreLayout] No store found or error:', error)
      // If 404, redirect to create store
      if (error?.message?.includes('404') || error?.status === 404) {
        console.log('[StoreLayout] 404 error, redirecting to create store')
        router.push('/create-store')
      }
    }
  }

  // Fetch user from cookie if Redux is empty
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[StoreLayout] Checking auth state...')
      
      // If user already in Redux and has seller/admin/super_admin role
      if (user && (user.role === 'seller' || user.role === 'admin' || user.role === 'super_admin')) {
        console.log('[StoreLayout] User in Redux - authorized')
        setIsAuthorized(true)
        setLocalLoading(false)
        return
      }

      // If we already have a user but role doesn't match, still stop loading
      if (user && !(user.role === 'seller' || user.role === 'admin' || user.role === 'super_admin')) {
        console.log('[StoreLayout] User role not seller/admin:', user.role)
        setIsAuthorized(false)
        setLocalLoading(false)
        return
      }

      // No user in Redux, fetch from server
      console.log('[StoreLayout] No user in Redux, fetching from /api/auth/me')
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          console.log('[StoreLayout] User fetched:', data.user)
          if (data.user && (data.user.role === 'seller' || data.user.role === 'admin' || data.user.role === 'super_admin')) {
            dispatch(setUser(data.user))
            dispatch(setAuthenticated(true))
            setIsAuthorized(true)
          } else {
            console.log('[StoreLayout] User role not seller/admin/super_admin:', data.user?.role)
            toast.error('You need seller privileges to access this area')
            setIsAuthorized(false)
          }
        } else {
          console.log('[StoreLayout] /api/auth/me returned', res.status)
          setIsAuthorized(false)
        }
      } catch (err) {
        console.error('[StoreLayout] Fetch error:', err)
        setIsAuthorized(false)
      } finally {
        setLocalLoading(false)
      }
    }

    checkAuth()
  }, [dispatch, user])

  // Fetch store info when user becomes available and authorized
  useEffect(() => {
    if (user && isAuthorized && !storeInfo) {
      fetchStoreInfo()
    }
  }, [user, isAuthorized, storeInfo])

  // Fetch unread notification count on mount and poll every 30s
  useEffect(() => {
    if (!isAuthorized) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [isAuthorized])

  // Redirect to login if not authenticated after loading
  useEffect(() => {
    if (!localLoading && !isAuthenticated) {
      router.push('/login?redirect=/store')
    }
  }, [localLoading, isAuthenticated, router])

  if (localLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">Please sign in to continue</h1>
        <Link href="/login?redirect=/store" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
          Go to Login <ArrowRightIcon size={18} />
        </Link>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
        <p className="text-slate-500 mt-4">This area is restricted to sellers only.</p>
        <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
          Go to home <ArrowRightIcon size={18} />
        </Link>
      </div>
    )
  }

  // Block access if store is not yet active
  if (storeInfo && storeInfo.status.toLowerCase() !== 'active') {
    const normalStatus = storeInfo.status.toLowerCase()
    const isPending = normalStatus === 'pending'
    const isRejected = normalStatus === 'inactive' || normalStatus === 'rejected' || normalStatus === 'suspended'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          {isPending ? (
            <>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏳</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Store Awaiting Approval</h1>
              <p className="text-slate-500 text-sm mb-6">
                Your store <strong>{storeInfo.name}</strong> has been submitted and is pending admin review.
                You will be notified once it is approved.
              </p>
              <Link href="/" className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition">
                <ArrowRightIcon size={14} className="rotate-180" /> Go to Home
              </Link>
            </>
          ) : isRejected ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Store Application Rejected</h1>
              <p className="text-slate-500 text-sm mb-4">
                Your store application was not approved.
                {storeInfo.rejection_reason && (
                  <span className="block mt-2 text-red-500">{storeInfo.rejection_reason}</span>
                )}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/create-store" className="bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition">
                  Submit New Application
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 border border-slate-300 text-slate-600 px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
                  <ArrowRightIcon size={14} className="rotate-180" /> Go to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Store Not Active</h1>
              <p className="text-slate-500 text-sm mb-6">Your store is currently not active. Please contact support.</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition">
                <ArrowRightIcon size={14} className="rotate-180" /> Go to Home
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <SellerNavbar 
        onNotificationsClick={() => setShowNotifications(true)}
        unreadCount={unreadCount}
      />
      <div className="flex flex-1 relative">
        <SellerSidebar storeInfo={storeInfo} />
        <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
          {isAuthorized ? children : null}
        </div>
      </div>
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => { setShowNotifications(false); fetchUnreadCount() }}
      />
    </div>
  )
}

export default StoreLayout