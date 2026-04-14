'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setUser, setAuthenticated } from "@/lib/features/auth/authSlice"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const authState = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false })
    const { user, isAuthenticated } = authState
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [localLoading, setLocalLoading] = useState(true)   // local loading state

    // Fetch user from cookie if Redux is empty
    useEffect(() => {
        const fetchUser = async () => {
            if (user) {
                setLocalLoading(false)
                return
            }
            try {
                console.log('[AdminLayout] Fetching user from /api/auth/me')
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (res.ok) {
                    const data = await res.json()
                    console.log('[AdminLayout] User fetched:', data.user)
                    dispatch(setUser(data.user))
                    dispatch(setAuthenticated(true))
                } else {
                    console.log('[AdminLayout] /api/auth/me returned', res.status)
                    dispatch(setAuthenticated(false))
                }
            } catch (err) {
                console.error('[AdminLayout] Fetch error:', err)
                dispatch(setAuthenticated(false))
            } finally {
                setLocalLoading(false)
            }
        }
        fetchUser()
    }, [user, dispatch])

    // Update authorization when user changes
    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'super_admin')) {
            setIsAuthorized(true)
        } else {
            setIsAuthorized(false)
        }
    }, [user])

    // Redirect to login if not authenticated after loading
    useEffect(() => {
        if (!localLoading && !isAuthenticated) {
            router.push('/login?redirect=/admin')
        }
    }, [localLoading, isAuthenticated, router])

    console.log('[AdminLayout] Render check:', { localLoading, isAuthenticated, isAuthorized, userRole: user?.role })

    if (localLoading) {
        console.log('[AdminLayout] Showing Loading spinner')
        return <Loading />
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-50">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ArrowRightIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-800 mb-2">Please sign in</h1>
                    <p className="text-slate-500 mb-8">You need to be logged in to access the admin panel.</p>
                    <Link href="/login?redirect=/admin" className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-all shadow-md hover:shadow-lg">
                        Go to Login <ArrowRightIcon size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-50">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-800 mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-8">This area is restricted to administrators only.</p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-all shadow-md hover:shadow-lg">
                        Go to Home <ArrowRightIcon size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-rose-50">
            <AdminNavbar />
            <div className="flex flex-1 relative">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout