'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, Filter, CheckCircle, XCircle, Store, X, Eye, MapPin, Mail, Phone, Calendar, User, MessageSquare, Bell, Send, Edit2, Trash2, Ban, Unlock, MoreHorizontal, Download, ChevronDown, Plus, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface StoreRequest {
    postal_code: any
    id: string
    name: string
    username: string
    email: string
    description: string
    address: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    country: string
    contact: string
    business_type: string
    type: 'reseller' | 'wholesale'
    status: 'active' | 'inactive' | 'suspended'
    is_active: boolean
    created_at: string
    updated_at: string
    approved_at?: string
    rejected_at?: string
    suspended_at?: string
    suspended_reason?: string
    rejection_reason?: string
    admin_comments?: string
    has_unread_notification: boolean
    notifications?: Notification[]
}

interface Notification {
    id: string
    message: string
    type: 'comment' | 'status_change'
    createdAt: string
    read: boolean
}

export default function AdminStores() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
    const [typeFilter, setTypeFilter] = useState<'all' | 'reseller' | 'wholesale'>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [selectedStores, setSelectedStores] = useState<string[]>([])
    const [selectedStore, setSelectedStore] = useState<StoreRequest | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showSuspendModal, setShowSuspendModal] = useState(false)
    const [suspendReason, setSuspendReason] = useState('')
    const [storeToDelete, setStoreToDelete] = useState<StoreRequest | null>(null)
    const [storeToSuspend, setStoreToSuspend] = useState<StoreRequest | null>(null)
    const [loading, setLoading] = useState(true)

    // Store data from API
    const [stores, setStores] = useState<StoreRequest[]>([])

    // Fetch stores from API
    const fetchStores = async () => {
        try {
            setLoading(true)
            const params: any = {}

            if (statusFilter !== 'all') {
                params.status = statusFilter
            }
            if (searchQuery) {
                params.query = searchQuery
            }

            const response: any = await apiClient.getAllStoresAdmin(params)
            // Map business_type to type for frontend compatibility
            const storesWithType = (response.stores || []).map((store: any) => ({
                ...store,
                type: store.business_type === 'reseller' ? 'reseller' : 'wholesale'
            }))
            setStores(storesWithType)
        } catch (error) {
            console.error('Failed to fetch stores:', error)
            toast.error('Failed to load stores')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    useEffect(() => {
        fetchStores()
    }, [statusFilter, searchQuery])

    const handleUpdateComments = async (storeId: string, comments: string) => {
        try {
            await apiClient.updateStore(storeId, { admin_comments: comments })
            toast.success('Comments updated')
            fetchStores()
        } catch (error) {
            toast.error('Failed to update comments')
        }
    }

    const handleSendNotification = async (storeId: string, message: string) => {
        try {
            await apiClient.sendStoreNotification(storeId, message, 'comment')
            toast.success('Notification sent')
            fetchStores()
        } catch (error) {
            toast.error('Failed to send notification')
        }
    }

    const markNotificationAsRead = async (storeId: string, notificationId: string) => {
        try {
            await apiClient.markNotificationAsRead(storeId, notificationId)
            fetchStores()
        } catch (error) {
            console.error('Failed to mark notification as read')
        }
    }

    const handleDeleteStore = async (storeId: string) => {
        try {
            await apiClient.deleteStore(storeId)
            toast.success('Store deleted successfully')
            fetchStores()
        } catch (error) {
            toast.error('Failed to delete store')
        }
    }

    const handleSuspendStore = async (storeId: string, reason: string) => {
        try {
            await apiClient.suspendStore(storeId, reason)
            toast.success('Store suspended successfully')
            fetchStores()
        } catch (error) {
            toast.error('Failed to suspend store')
        }
    }

    const handleReactivateStore = async (storeId: string) => {
        try {
            await apiClient.reactivateStore(storeId)
            toast.success('Store reactivated successfully')
            fetchStores()
        } catch (error) {
            toast.error('Failed to reactivate store')
        }
    }

    const handleEditStore = async (storeId: string, updatedData: any) => {
        try {
            await apiClient.updateStore(storeId, updatedData)
            toast.success('Store updated successfully')
            fetchStores()
        } catch (error) {
            toast.error('Failed to update store')
        }
    }

    const handleBulkSuspend = () => {
        const reason = 'Bulk suspension by admin'
        setStores(prev => prev.map(store => 
            selectedStores.includes(store.id)
                ? { 
                    ...store, 
                    isSuspended: true, 
                    suspendedAt: new Date().toISOString(),
                    suspendedReason: reason,
                    updatedAt: new Date().toISOString()
                  }
                : store
        ))
        setSelectedStores([])
    }

    const handleBulkDelete = () => {
        setStores(prev => prev.filter(store => !selectedStores.includes(store.id)))
        setSelectedStores([])
    }

    const exportToCSV = () => {
        const dataToExport = selectedStores.length > 0 
            ? stores.filter(s => selectedStores.includes(s.id))
            : filteredStores

        const headers = ['ID', 'Name', 'Username', 'Email', 'Type', 'Status', 'Address', 'Contact', 'Created', 'Updated', 'Active', 'Suspended']
        const rows = dataToExport.map(store => [
            store.id,
            store.name,
            store.username,
            store.email,
            store.business_type,
            store.status,
            store.address,
            store.contact,
            store.created_at,
            store.updated_at,
            store.is_active ? 'Yes' : 'No',
            store.suspended_at ? 'Yes' : 'No'
        ])

        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `stores_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const toggleSelectAll = () => {
        if (selectedStores.length === filteredStores.length) {
            setSelectedStores([])
        } else {
            setSelectedStores(filteredStores.map(s => s.id))
        }
    }

    const toggleSelectStore = (storeId: string) => {
        setSelectedStores(prev => 
            prev.includes(storeId) 
                ? prev.filter(id => id !== storeId)
                : [...prev, storeId]
        )
    }

    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.address.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || store.status === statusFilter || (statusFilter === 'suspended' && store.suspended_at)
        const matchesType = typeFilter === 'all' || store.type === typeFilter
        const matchesDateFrom = !dateFrom || new Date(store.created_at) >= new Date(dateFrom)
        const matchesDateTo = !dateTo || new Date(store.created_at) <= new Date(dateTo)
        return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo
    })

    const getStatusIcon = (status: StoreRequest['status']) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'inactive':
                return <XCircle className="w-5 h-5 text-red-600" />
            case 'suspended':
                return <Ban className="w-5 h-5 text-orange-600" />
            default:
                return <Store className="w-5 h-5 text-slate-600" />
        }
    }

    const getStatusColor = (status: StoreRequest['status'], isSuspended?: boolean) => {
        if (isSuspended) return 'bg-orange-100 text-orange-800'
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'inactive':
                return 'bg-red-100 text-red-800'
            case 'suspended':
                return 'bg-orange-100 text-orange-800'
        }
    }

    const getStatusLabel = (status: StoreRequest['status'], isSuspended?: boolean) => {
        if (isSuspended) return 'Suspended'
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const getTypeColor = (type: StoreRequest['type']) => {
        switch (type) {
            case 'reseller':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'wholesale':
                return 'bg-blue-100 text-blue-700 border-blue-200'
        }
    }

    const getTypeLabel = (type: StoreRequest['type']) => {
        switch (type) {
            case 'reseller':
                return 'Reseller (B2C)'
            case 'wholesale':
                return 'Wholesale (B2B)'
        }
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Store Management</h1>
                <p className="text-slate-500 mt-1">Review and manage seller store applications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Stores</p>
                            <p className="text-2xl font-bold text-slate-800">{stores.length}</p>
                        </div>
                        <Store className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Active</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stores.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Inactive/Suspended</p>
                            <p className="text-2xl font-bold text-red-600">
                                {stores.filter(s => s.status === 'inactive' || s.status === 'suspended').length}
                            </p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="ml-3 text-slate-600">Loading stores...</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search stores by name, email, username, address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter size={20} className="text-slate-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="reseller">Reseller (B2C)</option>
                            <option value="wholesale">Wholesale (B2B)</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="From"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="To"
                        />
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setStatusFilter('all')
                                setTypeFilter('all')
                                setDateFrom('')
                                setDateTo('')
                            }}
                            className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedStores.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-800">
                            {selectedStores.length} store{selectedStores.length !== 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleBulkSuspend}
                            className="px-2 sm:px-3 py-1.5 bg-orange-600 text-white text-xs sm:text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
                            title="Suspend selected"
                        >
                            <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Suspend</span>
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-2 sm:px-3 py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                            title="Delete selected"
                        >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                        <button
                            onClick={() => setSelectedStores([])}
                            className="px-2 sm:px-3 py-1.5 text-slate-600 hover:bg-blue-100 rounded-lg text-xs sm:text-sm transition-colors"
                        >
                            <span className="hidden sm:inline">Clear</span>
                            <span className="sm:hidden">&times;</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                    <Download className="w-4 h-4" />
                    Export {selectedStores.length > 0 ? `Selected (${selectedStores.length})` : 'All'} to CSV
                </button>
            </div>

            {/* Stores Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-3 sm:px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedStores.length === filteredStores.length && filteredStores.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300"
                                    />
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700 min-w-[200px]">Store</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700">Type</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700 min-w-[150px]">Contact</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700 min-w-[150px]">Location</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700 whitespace-nowrap">Submitted</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-slate-700 w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredStores.map((store) => (
                                <tr key={store.id} className={`hover:bg-slate-50 ${selectedStores.includes(store.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-3 sm:px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedStores.includes(store.id)}
                                            onChange={() => toggleSelectStore(store.id)}
                                            className="rounded border-slate-300"
                                        />
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-800">{store.name}</p>
                                                    {store.has_unread_notification && (
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">@{store.username}</p>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{store.description}</p>
                                            </div>
                                            {store.has_unread_notification && (
                                                <Bell className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeColor(store.type)}`}>
                                            {getTypeLabel(store.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{store.email}</p>
                                        <p className="text-sm text-slate-500">{store.contact}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{store.address_line1 || store.address}</p>
                                        {store.city && (
                                            <p className="text-xs text-slate-500">
                                                {store.city}{store.state ? `, ${store.state}` : ''}{store.postal_code ? ` ${store.postal_code}` : ''}{store.country ? `, ${store.country}` : ''}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(store.status, !!store.suspended_at)}`}>
                                            {store.suspended_at ? <Ban className="w-3 h-3 sm:w-4 sm:h-4" /> : getStatusIcon(store.status)}
                                            <span className="hidden sm:inline">{getStatusLabel(store.status, !!store.suspended_at)}</span>
                                            <span className="sm:hidden">{store.suspended_at ? 'Suspended' : store.status.slice(0, 3)}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">{new Date(store.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StoreActionsDropdown 
                                            store={store}
                                            onView={() => {
                                                setSelectedStore(store)
                                                setShowModal(true)
                                            }}
                                            onEdit={() => {
                                                setSelectedStore(store)
                                                setShowEditModal(true)
                                            }}
                                            onDelete={() => {
                                                setStoreToDelete(store)
                                                setShowDeleteModal(true)
                                            }}
                                            onSuspend={() => {
                                                setStoreToSuspend(store)
                                                setShowSuspendModal(true)
                                            }}
                                            onReactivate={() => handleReactivateStore(store.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredStores.length === 0 && (
                    <div className="text-center py-12">
                        <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No stores found</p>
                    </div>
                )}
            </div>

            {/* Store Details Modal */}
            {showModal && selectedStore && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{selectedStore.name}</h2>
                                        <p className="text-slate-500">@{selectedStore.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status & Type */}
                            <div className="flex flex-wrap gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${getTypeColor(selectedStore.type)}`}>
                                    {getTypeLabel(selectedStore.type)}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedStore.status, !!selectedStore.suspended_at)}`}>
                                    {selectedStore.suspended_at ? <Ban className="w-4 h-4" /> : getStatusIcon(selectedStore.status)}
                                    {getStatusLabel(selectedStore.status, !!selectedStore.suspended_at)}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h3 className="font-semibold text-slate-800 mb-2">About</h3>
                                <p className="text-slate-600">{selectedStore.description}</p>
                            </div>

                            {/* Contact Information */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        Contact
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium text-slate-800">Email:</span> {selectedStore.email}
                                        </p>
                                        <p className="text-sm text-slate-600 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            <span className="font-medium text-slate-800">Phone:</span> {selectedStore.contact}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        Location
                                    </h3>
                                    <p className="text-sm text-slate-600">{selectedStore.address}</p>
                                </div>
                            </div>

                            {/* Submission Info */}
                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
                                <Calendar className="w-4 h-4" />
                                <span>Submitted on {new Date(selectedStore.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Admin Comments - Editable */}
                            <StoreCommentsSection 
                                store={selectedStore} 
                                onUpdateComments={(comments) => handleUpdateComments(selectedStore.id, comments)}
                                onSendNotification={(message) => handleSendNotification(selectedStore.id, message)}
                            />


                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Store Modal */}
            {showEditModal && selectedStore && (
                <EditStoreModal
                    store={selectedStore}
                    onClose={() => setShowEditModal(false)}
                    onSave={(data) => {
                        handleEditStore(selectedStore.id, data)
                        setShowEditModal(false)
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && storeToDelete && (
                <DeleteConfirmationModal
                    store={storeToDelete}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => {
                        handleDeleteStore(storeToDelete.id)
                        setShowDeleteModal(false)
                    }}
                />
            )}

            {/* Suspend Store Modal */}
            {showSuspendModal && storeToSuspend && (
                <SuspendStoreModal
                    store={storeToSuspend}
                    reason={suspendReason}
                    onReasonChange={setSuspendReason}
                    onClose={() => {
                        setShowSuspendModal(false)
                        setSuspendReason('')
                    }}
                    onConfirm={() => {
                        handleSuspendStore(storeToSuspend.id, suspendReason || 'No reason provided')
                        setShowSuspendModal(false)
                        setSuspendReason('')
                    }}
                />
            )}
        </div>
    )
}

// Store Comments Section Component
interface StoreCommentsSectionProps {
    store: StoreRequest
    onUpdateComments: (comments: string) => void
    onSendNotification: (message: string) => void
}

function StoreCommentsSection({ store, onUpdateComments, onSendNotification }: StoreCommentsSectionProps) {
    const [comments, setComments] = useState(store.admin_comments || '')
    const [message, setMessage] = useState('')
    const [showMessageInput, setShowMessageInput] = useState(false)

    const handleSaveComments = () => {
        onUpdateComments(comments)
    }

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendNotification(message)
            setMessage('')
            setShowMessageInput(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Admin Comments */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Admin Comments (Internal Notes)</h3>
                </div>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add internal notes about this store application..."
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] text-sm"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSaveComments}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Save Comments
                    </button>
                </div>
            </div>

            {/* Send Message to Seller */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold text-slate-800">Notify Seller</h3>
                    </div>
                    {!showMessageInput && (
                        <button
                            onClick={() => setShowMessageInput(true)}
                            className="text-sm text-green-700 hover:text-green-800 font-medium"
                        >
                            + Send Message
                        </button>
                    )}
                </div>

                {showMessageInput && (
                    <div className="space-y-3">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message to send to the seller..."
                            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowMessageInput(false)}
                                className="px-3 py-1.5 text-slate-600 text-sm hover:bg-green-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <Send className="w-3 h-3" />
                                Send to Seller
                            </button>
                        </div>
                    </div>
                )}

                {/* Show existing notifications */}
                {store.notifications && store.notifications.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sent Messages</p>
                        {store.notifications?.map((notif) => (
                            <div key={notif.id} className="bg-white rounded-lg p-3 text-sm border border-green-200">
                                <p className="text-slate-700">{notif.message}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleString()} • {notif.read ? 'Read' : 'Unread'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Store Actions Dropdown Component
interface StoreActionsDropdownProps {
    store: StoreRequest
    onView: () => void
    onEdit: () => void
    onDelete: () => void
    onSuspend: () => void
    onReactivate: () => void
}

function StoreActionsDropdown({ store, onView, onEdit, onDelete, onSuspend, onReactivate }: StoreActionsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right
            })
        }
    }, [isOpen])

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return
        const handleClick = (e: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                // Check if click is inside dropdown
                const dropdown = document.getElementById(`store-dropdown-${store.id}`)
                if (!dropdown || !dropdown.contains(e.target as Node)) {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen, store.id])

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded hover:bg-slate-200 transition-colors min-w-[36px] sm:min-w-[auto]"
                aria-label="Actions"
            >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Actions</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div 
                    id={`store-dropdown-${store.id}`}
                    style={{
                        position: 'fixed',
                        top: dropdownPosition.top,
                        right: dropdownPosition.right,
                    }}
                    className="w-44 sm:w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-[100] py-1"
                >
                    <button
                        onClick={() => { onView(); setIsOpen(false) }}
                        className="w-full px-3 sm:px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                    <button
                        onClick={() => { onEdit(); setIsOpen(false) }}
                        className="w-full px-3 sm:px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Store
                    </button>
                    {store.suspended_at ? (
                        <button
                            onClick={() => { onReactivate(); setIsOpen(false) }}
                            className="w-full px-3 sm:px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                        >
                            <Unlock className="w-4 h-4" />
                            Reactivate
                        </button>
                    ) : (
                        <button
                            onClick={() => { onSuspend(); setIsOpen(false) }}
                            className="w-full px-3 sm:px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                            <Ban className="w-4 h-4" />
                            Suspend
                        </button>
                    )}
                    <div className="border-t border-slate-200 my-1" />
                    <button
                        onClick={() => { onDelete(); setIsOpen(false) }}
                        className="w-full px-3 sm:px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </>
    )
}

// Edit Store Modal Component
interface EditStoreModalProps {
    store: StoreRequest
    onClose: () => void
    onSave: (data: Partial<StoreRequest>) => void
}

function EditStoreModal({ store, onClose, onSave }: EditStoreModalProps) {
    const [formData, setFormData] = useState({
        name: store.name,
        username: store.username,
        email: store.email,
        description: store.description,
        address: store.address,
        address_line1: store.address_line1 || '',
        address_line2: store.address_line2 || '',
        city: store.city || '',
        state: store.state || '',
        postal_code: store.postal_code || '',
        country: store.country || '',
        contact: store.contact,
        type: store.type
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Edit Store</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                        <input
                            type="text"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
                        <input
                            type="text"
                            value={formData.address_line1}
                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label>
                        <input
                            type="text"
                            value={formData.address_line2}
                            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">State/Province</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'reseller' | 'wholesale' })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="reseller">Reseller (B2C)</option>
                            <option value="wholesale">Wholesale (B2B)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
    store: StoreRequest
    onClose: () => void
    onConfirm: () => void
}

function DeleteConfirmationModal({ store, onClose, onConfirm }: DeleteConfirmationModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Store?</h2>
                    <p className="text-slate-600 mb-6">
                        Are you sure you want to delete <strong>{store.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Suspend Store Modal Component
interface SuspendStoreModalProps {
    store: StoreRequest
    reason: string
    onReasonChange: (reason: string) => void
    onClose: () => void
    onConfirm: () => void
}

function SuspendStoreModal({ store, reason, onReasonChange, onClose, onConfirm }: SuspendStoreModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Ban className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Suspend Store</h2>
                            <p className="text-slate-500">{store.name}</p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Suspension Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="Enter reason for suspending this store..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!reason.trim()}
                            className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suspend Store
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
