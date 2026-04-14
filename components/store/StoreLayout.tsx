'use client'
import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
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
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false })
  const [localLoading, setLocalLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)

  const fetchStoreInfo = async () => {
    try {
      const response: any = await apiClient.getMyStore()
      if (response && response.store) {
        setStoreInfo({
          id: response.store.id,
          name: response.store.name,
          username: response.store.username || response.store.id,
          logo: response.store.logo || null,
        })
      }
    } catch (error) {
      console.log('[StoreLayout] No store found or error:', error)
    }
  }

  // Fetch user from cookie if Redux is empty
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[StoreLayout] Checking auth state...')
      
      // If user already in Redux and has seller/admin role
      if (user && (user.role === 'seller' || user.role === 'admin')) {
        console.log('[StoreLayout] User in Redux - authorized')
        setIsAuthorized(true)
        setLocalLoading(false)
        return
      }

      // If we already have a user but role doesn't match, still stop loading
      if (user && !(user.role === 'seller' || user.role === 'admin')) {
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
          if (data.user && (data.user.role === 'seller' || data.user.role === 'admin')) {
            dispatch(setUser(data.user))
            dispatch(setAuthenticated(true))
            setIsAuthorized(true)
          } else {
            console.log('[StoreLayout] User role not seller/admin:', data.user?.role)
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <SellerNavbar />
      <div className="flex flex-1 relative">
        <SellerSidebar storeInfo={storeInfo} />
        <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
          {children}
        </div>
      </div>
    </div>
  )
}

export default StoreLayout