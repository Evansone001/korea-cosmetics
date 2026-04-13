'use client'
import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, Clock, Store, AlertTriangle, Package } from 'lucide-react'
import { apiClient, Product } from '@/lib/api-client'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface StoreRequest {
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
    status: 'pending' | 'active' | 'inactive' | 'suspended'
    is_active: boolean
    created_at: string
    updated_at: string
    approved_at?: string
    rejected_at?: string
    suspended_at?: string
    suspended_reason?: string
    admin_comments?: string
    rejection_reason?: string
}

export default function AdminApprove() {
    const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores')
    const [searchQuery, setSearchQuery] = useState('')
    const [stores, setStores] = useState<StoreRequest[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchPendingStores = async () => {
        try {
            setLoading(true)
            const response: any = await apiClient.getPendingStores()
            // Map business_type to type for frontend compatibility
            const storesWithType = (response.stores || []).map((store: any) => ({
                ...store,
                type: store.business_type === 'reseller' ? 'reseller' : 'wholesale'
            }))
            setStores(storesWithType)
        } catch (error) {
            console.error('Failed to fetch pending stores:', error)
            toast.error('Failed to load pending stores')
        } finally {
            setLoading(false)
        }
    }

    const fetchPendingProducts = async () => {
        try {
            setLoading(true)
            const response: any = await apiClient.getProducts()
            // Filter only pending products
            const pendingProducts = (response.products || []).filter((p: Product) => p.status === 'pending')
            setProducts(pendingProducts)
        } catch (error) {
            console.error('Failed to fetch products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'stores') {
            fetchPendingStores()
        } else {
            fetchPendingProducts()
        }
    }, [activeTab])

    const handleApprove = async (storeId: string) => {
        try {
            setActionLoading(storeId)
            await apiClient.approveStore(storeId)
            toast.success('Store approved successfully')
            fetchPendingStores()
        } catch (error) {
            console.error('Failed to approve store:', error)
            toast.error('Failed to approve store')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (storeId: string) => {
        const reason = prompt('Please enter rejection reason:')
        if (!reason) return

        try {
            setActionLoading(storeId)
            await apiClient.rejectStore(storeId, reason)
            toast.success('Store rejected successfully')
            fetchPendingStores()
        } catch (error) {
            console.error('Failed to reject store:', error)
            toast.error('Failed to reject store')
        } finally {
            setActionLoading(null)
        }
    }

    const handleApproveProduct = async (productId: string) => {
        try {
            setActionLoading(productId)
            await apiClient.approveProduct(productId)
            toast.success('Product approved successfully')
            fetchPendingProducts()
        } catch (error) {
            console.error('Failed to approve product:', error)
            toast.error('Failed to approve product')
        } finally {
            setActionLoading(null)
        }
    }

    const handleRejectProduct = async (productId: string) => {
        const reason = prompt('Please enter rejection reason:')
        if (!reason) return

        try {
            setActionLoading(productId)
            await apiClient.rejectProduct(productId, reason)
            toast.success('Product rejected successfully')
            fetchPendingProducts()
        } catch (error) {
            console.error('Failed to reject product:', error)
            toast.error('Failed to reject product')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            store.username.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    const filteredProducts = products.filter(product => {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const getStatusIcon = (status: StoreRequest['status']) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'inactive':
                return <XCircle className="w-5 h-5 text-red-600" />
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />
            case 'suspended':
                return <AlertTriangle className="w-5 h-5 text-orange-600" />
        }
    }

    const getStatusColor = (status: StoreRequest['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'inactive':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'suspended':
                return 'bg-orange-100 text-orange-800'
        }
    }

    const getStoreTypeBadge = (storeType: StoreRequest['type']) => {
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

    const pendingCount = stores.length
    const pendingProductCount = products.length

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Approval Queue</h1>
                <p className="text-slate-500 mt-1">
                    Review and approve seller applications and products
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('stores')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'stores'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <Store size={18} />
                    Stores
                    {pendingCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'products'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <Package size={18} />
                    Products
                    {pendingProductCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {pendingProductCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {activeTab === 'stores' ? (
                    <>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Pending Stores</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stores.length}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Resellers (B2C)</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stores.filter(s => s.type === 'reseller').length}
                                    </p>
                                </div>
                                <Store className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Wholesale (B2B)</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stores.filter(s => s.type === 'wholesale').length}
                                    </p>
                                </div>
                                <Store className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Pending Products</p>
                                    <p className="text-2xl font-bold text-yellow-600">{products.length}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Total Products</p>
                                    <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                                </div>
                                <Package className="w-8 h-8 text-slate-400" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Approved Today</p>
                                    <p className="text-2xl font-bold text-green-600">-</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="ml-3 text-slate-600">
                        {activeTab === 'stores' ? 'Loading pending stores...' : 'Loading pending products...'}
                    </p>
                </div>
            )}

            {/* Filters */}
            {!loading && (
                <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search stores by name, email, username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Content List */}
            {!loading && activeTab === 'stores' && (
                <div className="space-y-4">
                    {filteredStores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Store className="w-5 h-5 text-purple-500" />
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                            Store
                                        </span>
                                        {getStoreTypeBadge(store.type)}
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                                            {getStatusIcon(store.status)}
                                            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold text-slate-800">{store.name}</h3>
                                    <p className="text-sm text-slate-500">@{store.username} ({store.email})</p>
                                    <p className="text-slate-600 mt-2">{store.description}</p>
                                    
                                    <div className="flex gap-4 mt-3 text-sm">
                                        <span className="text-slate-500">
                                            Location: <span className="font-medium text-slate-700">{store.city}, {store.country}</span>
                                        </span>
                                        <span className="text-slate-500">
                                            Contact: <span className="font-medium text-slate-700">{store.contact}</span>
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-400 mt-3">
                                        Submitted on {new Date(store.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    {actionLoading === store.id ? (
                                        <div className="w-24 h-10 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleApprove(store.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(store.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredStores.length === 0 && (
                        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
                            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No pending stores found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Products List */}
            {!loading && activeTab === 'products' && (
                <div className="space-y-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Product Image */}
                                <div className="relative w-full lg:w-48 h-48 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0].startsWith('http')
                                                ? product.images[0]
                                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0]}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                                                    PENDING
                                                </span>
                                                <span className="text-sm text-slate-500">{product.category}</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                                            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg font-bold text-slate-900">${product.price}</p>
                                            {product.mrp && (
                                                <p className="text-sm text-slate-400 line-through">${product.mrp}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                                        {product.manufacturer && (
                                            <span>Manufacturer: {product.manufacturer}</span>
                                        )}
                                        {product.brand && (
                                            <span>Brand: {product.brand}</span>
                                        )}
                                        {product.origin && (
                                            <span>Origin: {product.origin}</span>
                                        )}
                                        <span>Stock: {product.stock_quantity || 0}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-4">
                                        {actionLoading === product.id ? (
                                            <div className="w-24 h-10 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleApproveProduct(product.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <CheckCircle size={18} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectProduct(product.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <XCircle size={18} />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No pending products found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
