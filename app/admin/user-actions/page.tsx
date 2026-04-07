'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface UserAction {
  id: string
  userId: string
  userName: string
  userEmail: string
  action: string
  entityType: string | null
  entityId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

const actionLabels: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  PASSWORD_CHANGE: 'Password Change',
  ORDER_PLACED: 'Order Placed',
  ORDER_CANCELLED: 'Order Cancelled',
  PROFILE_UPDATE: 'Profile Update',
  ADDRESS_ADDED: 'Address Added',
  ADDRESS_UPDATED: 'Address Updated',
  ADDRESS_DELETED: 'Address Deleted',
  STORE_CREATED: 'Store Created',
  STORE_UPDATED: 'Store Updated',
  PRODUCT_ADDED: 'Product Added',
  PRODUCT_UPDATED: 'Product Updated',
}

export default function UserActionsPage() {
  const [actions, setActions] = useState<UserAction[]>([])
  const [loading, setLoading] = useState(true)
  const [userIdFilter, setUserIdFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  const fetchActions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userIdFilter) params.set('userId', userIdFilter)
      if (actionFilter) params.set('action', actionFilter)
      params.set('limit', '50')
      
      const response = await fetch(`/api/admin/user-actions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch actions')
      
      const data = await response.json()
      setActions(data.actions || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError('Failed to load user actions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchActions()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Action Logs</h1>
          <p className="text-gray-600">Track critical user activities across the platform</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                placeholder="Filter by user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                {Object.entries(actionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {actions.length} of {total} actions
        </div>

        {/* Actions Table */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No actions found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actions.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(action.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {action.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {action.userEmail}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {action.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {actionLabels[action.action] || action.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {action.entityType ? (
                        <>
                          <span className="capitalize">{action.entityType}</span>
                          {action.entityId && (
                            <span className="text-gray-400 ml-1">({action.entityId.slice(0, 8)}...)</span>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {action.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
