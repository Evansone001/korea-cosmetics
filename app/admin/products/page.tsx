'use client'
import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, Clock, Package, AlertTriangle, Eye } from 'lucide-react'
import { apiClient, Product } from '@/lib/api-client'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AdminProductsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response: any = await apiClient.getProducts()
            setProducts(response.products || [])
        } catch (error) {
            console.error('Failed to fetch products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleApprove = async (productId: string) => {
        try {
            setActionLoading(productId)
            await apiClient.approveProduct(productId)
            toast.success('Product approved successfully')
            fetchProducts()
        } catch (error) {
            console.error('Failed to approve product:', error)
            toast.error('Failed to approve product')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (productId: string) => {
        const reason = prompt('Please enter rejection reason:')
        if (!reason) return

        try {
            setActionLoading(productId)
            await apiClient.rejectProduct(productId, reason)
            toast.success('Product rejected successfully')
            fetchProducts()
        } catch (error) {
            console.error('Failed to reject product:', error)
            toast.error('Failed to reject product')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === 'all' ? true : product.status === 'pending'
        return matchesSearch && matchesTab
    })

    const pendingCount = products.filter(p => p.status === 'pending').length

    const getStatusIcon = (status: Product['status']) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'inactive':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'draft':
                return <AlertTriangle className="w-5 h-5 text-gray-500" />
            default:
                return <Package className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusColor = (status: Product['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700'
            case 'active':
                return 'bg-green-100 text-green-700'
            case 'inactive':
                return 'bg-red-100 text-red-700'
            case 'draft':
                return 'bg-gray-100 text-gray-700'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Product Approvals</h1>
                <p className="text-slate-500 mt-1">
                    Review and approve seller products before they go live
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Products</p>
                            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-slate-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Active Products</p>
                            <p className="text-2xl font-bold text-green-600">
                                {products.filter(p => p.status === 'active').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'pending'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Pending ({pendingCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All Products
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No products found</h3>
                        <p className="text-slate-500 mt-1">
                            {activeTab === 'pending' 
                                ? 'No products pending approval' 
                                : 'No products match your search'}
                        </p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                        >
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
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                                                    {product.status?.toUpperCase()}
                                                </span>
                                                <span className="text-sm text-slate-500">{product.category}</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
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
                                    {product.status === 'pending' && (
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => handleApprove(product.id)}
                                                disabled={actionLoading === product.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                            >
                                                <CheckCircle size={18} />
                                                {actionLoading === product.id ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(product.id)}
                                                disabled={actionLoading === product.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
