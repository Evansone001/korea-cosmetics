'use client'
import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setUser, setLoading, setAuthenticated } from "@/lib/features/auth/authSlice"

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
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false, isLoading: true })
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[StoreLayout] Demo mode - checking Redux state')
      
      // Check if user already in Redux
      if (user && (user.role === 'seller' || user.role === 'admin')) {
        console.log('[StoreLayout] User in Redux - authorized')
        setIsAuthorized(true)
        dispatch(setLoading(false))
        setStoreInfo({
          id: '1',
          name: 'K-Beauty Store',
          username: 'kbeauty-store',
          logo: null,
        })
        return
      }

      // Try to restore user from cookie (demo mode - simple decode)
      console.log('[StoreLayout] No user in Redux, checking cookie')
      try {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(c => c.trim().startsWith('auth-token='))
        
        if (authCookie) {
          const token = authCookie.split('=')[1]
          // Simple decode for demo - get payload
          const payload = JSON.parse(atob(token.split('.')[1]))
          
          if (payload.role === 'seller' || payload.role === 'admin') {
            console.log('[StoreLayout] Restored user from cookie')
            dispatch(setUser({
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              role: payload.role,
              email_verified: false,
              auth_provider: null,
              last_login_method: "email"
            }))
            dispatch(setAuthenticated(true))
            setIsAuthorized(true)
            dispatch(setLoading(false))
            setStoreInfo({
              id: '1',
              name: 'K-Beauty Store',
              username: 'kbeauty-store',
              logo: null,
            })
            return
          }
        }
      } catch (error) {
        console.error('[StoreLayout] Cookie decode failed:', error)
      }

      console.log('[StoreLayout] No user found - redirecting')
      dispatch(setLoading(false))
    }

    checkAuth()
  }, [dispatch, user])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/store')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
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
