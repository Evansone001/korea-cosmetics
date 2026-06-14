'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAppSelector } from '@/lib/hooks'
import { Loader2, Store, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface SellerStatus {
  canAccess: boolean
  role: string | null
  isAdmin: boolean
  store: {
    id: string
    name: string
    status: string
    username?: string
    isPlatformAdmin?: boolean
  } | null
  resellerApplication: any
  needsOnboarding: boolean
  needsApproval: boolean
  nextStep: string | null
  metrics: any
}

export default function SellerPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAppSelector(
    state => state?.auth || { isAuthenticated: false, isLoading: true, user: null }
  )

  // Single API call for complete seller context
  const { data: sellerStatus, isLoading, error } = useQuery<SellerStatus>({
    queryKey: ['seller-status'],
    queryFn: async () => {
      const res: any = await apiClient.request('/api/seller/status')
      return res
    },
    enabled: isAuthenticated,
    retry: false
  })

  // Handle routing based on unified status
  useEffect(() => {
    if (!isLoading && sellerStatus) {
      if (!sellerStatus.canAccess && sellerStatus.nextStep) {
        // Redirect to appropriate step in the flow
        if (sellerStatus.needsOnboarding) {
          router.push(sellerStatus.nextStep)
        } else if (sellerStatus.needsApproval) {
          router.push('/reseller-application-status')
        }
      }
    }
  }, [sellerStatus, isLoading, router])

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading seller dashboard...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    router.push('/login?redirect=/seller')
    return null
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Error</h2>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    )
  }

  // No status yet
  if (!sellerStatus) {
    return null
  }

  // Admin in platform mode
  if (sellerStatus.isAdmin && !sellerStatus.store?.isPlatformAdmin) {
    return <AdminSellerDashboard status={sellerStatus} />
  }

  // Regular seller with full access
  if (sellerStatus.canAccess && sellerStatus.store) {
    return <SellerDashboard status={sellerStatus} />
  }

  // Fallback - shouldn't reach here if routing works
  return <OnboardingRedirect nextStep={sellerStatus.nextStep} />
}

// Components
function AdminSellerDashboard({ status }: { status: SellerStatus }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Seller Dashboard</h1>
            <p className="text-slate-500 text-sm">Admin access to all seller features</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              Admin Mode
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {status.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Total Stores" 
              value={status.metrics.totalStores} 
              icon={<Store className="w-5 h-5" />}
            />
            <MetricCard 
              title="Active Stores" 
              value={status.metrics.activeStores} 
              color="green"
            />
            <MetricCard 
              title="Pending Stores" 
              value={status.metrics.pendingStores} 
              color="amber"
            />
            <MetricCard 
              title="Pending Reseller Apps" 
              value={status.metrics.pendingResellerApps} 
              color="blue"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <ActionLink href="/admin/wholesale-orders" label="Manage Wholesale Orders" />
              <ActionLink href="/admin/stores" label="Approve Stores" />
              <ActionLink href="/admin/resellers" label="Review Reseller Applications" />
              <ActionLink href="/store/inventory" label="Platform Inventory" />
            </div>
          </div>

          {/* Store management */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Store</h2>
            {status.store ? (
              <div className="space-y-3">
                <p className="text-slate-600">
                  Store: <span className="font-medium text-slate-900">{status.store.name}</span>
                </p>
                <p className="text-slate-600">
                  Status: <span className={`inline-flex px-2 py-1 rounded text-sm ${
                    status.store.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>{status.store.status}</span>
                </p>
                <a 
                  href="/store" 
                  className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mt-2"
                >
                  Go to Store Dashboard <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600">You don't have a personal store yet.</p>
                <button 
                  onClick={() => window.location.href = '/create-store'}
                  className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                >
                  Create Store
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function SellerDashboard({ status }: { status: SellerStatus }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{status.store?.name}</h1>
            <p className="text-slate-500 text-sm">@{status.store?.username}</p>
          </div>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            status.store?.status === 'active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {status.store?.status}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {status.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Products" value={status.metrics.products} />
            <MetricCard title="Orders" value={status.metrics.orders} />
            <MetricCard title="Inventory Items" value={status.metrics.inventory} />
            <MetricCard title="Purchases" value={status.metrics.purchases} />
          </div>
        )}

        {/* Seller quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Products</h2>
            <div className="space-y-2">
              <ActionLink href="/store/catalog" label="Manage Catalog" />
              <ActionLink href="/store/inventory" label="View Inventory" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Orders</h2>
            <div className="space-y-2">
              <ActionLink href="/store/orders" label="View Orders" />
              <ActionLink href="/store/orders/wholesale" label="Wholesale Orders" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Warehouse</h2>
            <div className="space-y-2">
              <ActionLink href="/store/warehouse" label="Purchase Products" />
              <ActionLink href="/admin/wholesale-orders" label="My Purchases" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon,
  color = 'slate'
}: { 
  title: string
  value: number
  icon?: React.ReactNode
  color?: 'slate' | 'green' | 'amber' | 'blue'
}) {
  const colorClasses = {
    slate: 'bg-slate-50 border-slate-200',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700'
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-sm text-slate-500">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value || 0}</p>
    </div>
  )
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <a 
      href={href}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 group"
    >
      <span className="text-slate-700 group-hover:text-slate-900">{label}</span>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600" />
    </a>
  )
}

function OnboardingRedirect({ nextStep }: { nextStep: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
        <p className="text-slate-600">Redirecting to {nextStep}...</p>
      </div>
    </div>
  )
}
