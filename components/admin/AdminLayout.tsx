'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import Loading from '../Loading'
import AdminNavbar from './AdminNavbar'
import AdminSidebar from './AdminSidebar'
import { useAppSelector } from '@/lib/hooks'

// ---------------------------------------------------------------------------
// Reusable message screen for authentication / authorization fallbacks
// ---------------------------------------------------------------------------
function AuthMessage({
  icon,
  title,
  description,
  linkHref,
  linkText,
  iconContainerClassName,
}: {
  icon: React.ReactNode
  title: string
  description: string
  linkHref: string
  linkText: string
  iconContainerClassName?: string
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            iconContainerClassName ?? 'bg-slate-100'
          }`}
        >
          {icon}
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-800">{title}</h1>
        <p className="mb-8 text-slate-500">{description}</p>
        <Link
          href={linkHref}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-6 py-3 text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg"
        >
          {linkText} <ArrowRightIcon size={18} />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Admin layout – auth gate + admin shell
// ---------------------------------------------------------------------------
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  // Safely read auth state (assuming state.auth is always defined)
  const { user, isAuthenticated, isLoading, authChecked } =
    useAppSelector((state) => state.auth)

  // Memoised authorisation check
  const isAuthorized = useMemo(
    () => user?.role === 'admin' || user?.role === 'super_admin',
    [user],
  )

  // Redirect if the user is not logged in or lacks the admin role.
  // We wait for the initial auth check and any ongoing loading to finish.
  useEffect(() => {
    if (!authChecked || isLoading) return

    if (!isAuthenticated) {
      router.replace('/login?redirect=/admin')
      return
    }

    // If the user object exists but is not an admin → kick them out.
    // (If user is unexpectedly null, isAuthorized will be false and they
    // will be redirected to "/" – a sensible safety net.)
    if (!isAuthorized) {
      router.replace('/')
    }
  }, [authChecked, isLoading, isAuthenticated, isAuthorized, router])

  // ---- Loading state ----
  if (!authChecked || isLoading) {
    return <Loading />
  }

  // ---- Not authenticated ----
  if (!isAuthenticated) {
    return (
      <AuthMessage
        icon={<ArrowRightIcon className="h-8 w-8 text-slate-400" />}
        title="Please sign in"
        description="You need to be logged in to access the admin panel."
        linkHref="/login?redirect=/admin"
        linkText="Go to Login"
      />
    )
  }

  // ---- Authenticated but not authorised ----
  if (!isAuthorized) {
    return (
      <AuthMessage
        icon={<span className="text-2xl">🔒</span>}
        title="Access Denied"
        description="This area is restricted to administrators only."
        linkHref="/"
        linkText="Go to Home"
        iconContainerClassName="bg-red-100"
      />
    )
  }

  // ---- Authorised – render admin layout ----
  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-pink-50 to-rose-50">
      <AdminNavbar />
      <div className="relative flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 scroll-smooth sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout