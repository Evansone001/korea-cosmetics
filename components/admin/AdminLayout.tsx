'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setUser, setLoading } from "@/lib/features/auth/authSlice"

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const authState = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false, isLoading: true })
    const { user, isAuthenticated, isLoading } = authState
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        console.log('[AdminLayout] Checking auth state')
        
        // Trust middleware - if user is in Redux, they're already authenticated
        if (user && user.role === 'admin') {
            console.log('[AdminLayout] Admin user authorized')
            setIsAuthorized(true)
            dispatch(setLoading(false))
            return
        }

        // If no user in Redux, redirect to login
        console.log('[AdminLayout] No user in Redux, redirecting')
        dispatch(setLoading(false))
    }, [dispatch, user])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login?redirect=/admin')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
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
