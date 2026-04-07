'use client'
import { useState } from 'react'
import { Search, Filter, CheckCircle, XCircle, Clock, Package, Store } from 'lucide-react'

interface ApprovalItem {
    id: string
    type: 'product' | 'store'
    name: string
    seller: string
    sellerEmail: string
    description: string
    submittedAt: string
    status: 'pending' | 'approved' | 'rejected'
    storeType?: 'reseller' | 'wholesale'
    details?: {
        price?: number
        category?: string
        stock?: number
    }
}

export default function AdminApprove() {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'store'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

    // Sample approval items
    const [items, setItems] = useState<ApprovalItem[]>([
        {
            id: 'prod_1',
            type: 'product',
            name: 'Korean Snail Mucin Essence',
            seller: 'K-Beauty Cosmetics',
            sellerEmail: 'contact@kbeauty.com',
            description: 'Premium snail mucin essence for glowing skin',
            submittedAt: '2026-01-15',
            status: 'pending',
            details: { price: 1299, category: 'Skincare', stock: 50 }
        },
        {
            id: 'prod_2',
            type: 'product',
            name: 'Vitamin C Brightening Serum',
            seller: 'Seoul Glow',
            sellerEmail: 'hello@seoulglow.co.ke',
            description: 'High potency vitamin C serum for brightening',
            submittedAt: '2026-01-14',
            status: 'pending',
            details: { price: 899, category: 'Serums', stock: 30 }
        },
        {
            id: 'store_1',
            type: 'store',
            name: 'Glow Up Kenya',
            seller: 'Jane Doe',
            sellerEmail: 'jane@glowup.co.ke',
            description: 'New store application for K-beauty products in Kisumu',
            submittedAt: '2026-01-13',
            status: 'pending',
            storeType: 'reseller'
        },
        {
            id: 'store_2',
            type: 'store',
            name: 'Beauty Wholesale Kenya',
            seller: 'Robert Kimani',
            sellerEmail: 'orders@beautywholesale.co.ke',
            description: 'B2B wholesale supplier for bulk Korean beauty products to retailers',
            submittedAt: '2026-01-16',
            status: 'pending',
            storeType: 'wholesale'
        },
        {
            id: 'store_3',
            type: 'store',
            name: 'K-Beauty Distributors Ltd',
            seller: 'Grace Wanjiku',
            sellerEmail: 'info@kbeautydistributors.co.ke',
            description: 'Large-scale B2B distributor of premium Korean cosmetics across East Africa',
            submittedAt: '2026-01-17',
            status: 'pending',
            storeType: 'wholesale'
        },
        {
            id: 'prod_3',
            type: 'product',
            name: 'Hyaluronic Acid Moisturizer',
            seller: 'K-Beauty Cosmetics',
            sellerEmail: 'contact@kbeauty.com',
            description: 'Deep hydration moisturizer',
            submittedAt: '2026-01-12',
            status: 'approved',
            details: { price: 749, category: 'Moisturizers', stock: 100 }
        }
    ])

    const handleApprove = (id: string) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, status: 'approved' } : item
        ))
    }

    const handleReject = (id: string) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, status: 'rejected' } : item
        ))
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.seller.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = typeFilter === 'all' || item.type === typeFilter
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        return matchesSearch && matchesType && matchesStatus
    })

    const getStatusIcon = (status: ApprovalItem['status']) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />
        }
    }

    const getStatusColor = (status: ApprovalItem['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
        }
    }

    const getStoreTypeBadge = (storeType: ApprovalItem['storeType']) => {
        if (!storeType) return null
        if (storeType === 'reseller') {
            return (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    Reseller (B2C)
                </span>
            )
        }
        return (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                Wholesale (B2B)
            </span>
        )
    }

    const pendingCount = items.filter(i => i.status === 'pending').length

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Approval Queue</h1>
                <p className="text-slate-500 mt-1">
                    Review and approve products and stores awaiting approval
                    {pendingCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                            {pendingCount} pending
                        </span>
                    )}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {items.filter(i => i.status === 'pending').length}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Products</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {items.filter(i => i.type === 'product').length}
                            </p>
                        </div>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Stores</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {items.filter(i => i.type === 'store').length}
                            </p>
                        </div>
                        <Store className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Approved Today</p>
                            <p className="text-2xl font-bold text-green-600">
                                {items.filter(i => i.status === 'approved').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search items or sellers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="product">Products</option>
                            <option value="store">Stores</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {item.type === 'product' ? (
                                        <Package className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <Store className="w-5 h-5 text-purple-500" />
                                    )}
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        item.type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                        {item.type === 'product' ? 'Product' : 'Store'}
                                    </span>
                                    {item.type === 'store' && item.storeType && getStoreTypeBadge(item.storeType)}
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {getStatusIcon(item.status)}
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
                                <p className="text-sm text-slate-500">by {item.seller} ({item.sellerEmail})</p>
                                <p className="text-slate-600 mt-2">{item.description}</p>
                                
                                {item.details && item.type === 'product' && (
                                    <div className="flex gap-4 mt-3 text-sm">
                                        <span className="text-slate-500">
                                            Price: <span className="font-medium text-slate-700">KShs{item.details.price}</span>
                                        </span>
                                        <span className="text-slate-500">
                                            Category: <span className="font-medium text-slate-700">{item.details.category}</span>
                                        </span>
                                        <span className="text-slate-500">
                                            Stock: <span className="font-medium text-slate-700">{item.details.stock} units</span>
                                        </span>
                                    </div>
                                )}
                                
                                <p className="text-xs text-slate-400 mt-3">
                                    Submitted on {new Date(item.submittedAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                                {item.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(item.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {item.status === 'approved' ? 'Approved' : 'Rejected'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No items found matching your criteria</p>
                </div>
            )}
        </div>
    )
}
