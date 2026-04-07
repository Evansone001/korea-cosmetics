'use client'
import { useState } from 'react'
import { Search, Plus, Copy, Trash2, Edit2, Percent, Calendar, Users, Check, X } from 'lucide-react'

interface Coupon {
    id: string
    code: string
    description: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    minOrderAmount?: number
    maxDiscount?: number
    usageLimit: number
    usageCount: number
    startDate: string
    endDate: string
    status: 'active' | 'expired' | 'disabled'
    applicableTo: 'all' | 'new_users' | 'members'
}

export default function AdminCoupons() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Sample coupons data
    const [coupons, setCoupons] = useState<Coupon[]>([
        {
            id: 'coup_1',
            code: 'NEW20',
            description: '20% off for new users',
            discountType: 'percentage',
            discountValue: 20,
            minOrderAmount: 1000,
            maxDiscount: 2000,
            usageLimit: 100,
            usageCount: 45,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            status: 'active',
            applicableTo: 'new_users'
        },
        {
            id: 'coup_2',
            code: 'WELCOME10',
            description: '10% off first order',
            discountType: 'percentage',
            discountValue: 10,
            minOrderAmount: 500,
            usageLimit: 500,
            usageCount: 234,
            startDate: '2026-01-01',
            endDate: '2026-06-30',
            status: 'active',
            applicableTo: 'new_users'
        },
        {
            id: 'coup_3',
            code: 'FLAT500',
            description: 'Flat KShs 500 off on orders above KShs 3000',
            discountType: 'fixed',
            discountValue: 500,
            minOrderAmount: 3000,
            usageLimit: 200,
            usageCount: 189,
            startDate: '2026-01-15',
            endDate: '2026-03-15',
            status: 'expired',
            applicableTo: 'all'
        },
        {
            id: 'coup_4',
            code: 'MEMBER15',
            description: '15% off for registered members',
            discountType: 'percentage',
            discountValue: 15,
            minOrderAmount: 1500,
            maxDiscount: 1500,
            usageLimit: 1000,
            usageCount: 567,
            startDate: '2026-02-01',
            endDate: '2026-12-31',
            status: 'active',
            applicableTo: 'members'
        },
        {
            id: 'coup_5',
            code: 'B2BDEAL',
            description: 'Special B2B wholesale discount',
            discountType: 'percentage',
            discountValue: 25,
            minOrderAmount: 10000,
            maxDiscount: 10000,
            usageLimit: 50,
            usageCount: 12,
            startDate: '2026-03-01',
            endDate: '2026-12-31',
            status: 'active',
            applicableTo: 'members'
        }
    ])

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            setCoupons(prev => prev.filter(c => c.id !== id))
        }
    }

    const handleToggleStatus = (id: string) => {
        setCoupons(prev => prev.map(coupon => {
            if (coupon.id === id) {
                return {
                    ...coupon,
                    status: coupon.status === 'active' ? 'disabled' : 'active'
                }
            }
            return coupon
        }))
    }

    const filteredCoupons = coupons.filter(coupon => 
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: Coupon['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'expired':
                return 'bg-gray-100 text-gray-800'
            case 'disabled':
                return 'bg-red-100 text-red-800'
        }
    }

    const getApplicableBadge = (applicableTo: Coupon['applicableTo']) => {
        switch (applicableTo) {
            case 'all':
                return 'bg-blue-100 text-blue-700'
            case 'new_users':
                return 'bg-green-100 text-green-700'
            case 'members':
                return 'bg-purple-100 text-purple-700'
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Coupon Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage discount coupons for your store</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Coupons</p>
                            <p className="text-2xl font-bold text-slate-800">{coupons.length}</p>
                        </div>
                        <Percent className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Active</p>
                            <p className="text-2xl font-bold text-green-600">
                                {coupons.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Usage</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {coupons.reduce((acc, c) => acc + c.usageCount, 0)}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Expired</p>
                            <p className="text-2xl font-bold text-gray-600">
                                {coupons.filter(c => c.status === 'expired').length}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search coupons by code or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Code</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Description</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Discount</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Usage</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Valid Until</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                                                {coupon.code}
                                            </code>
                                            <button
                                                onClick={() => handleCopyCode(coupon.code, coupon.id)}
                                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                title="Copy code"
                                            >
                                                {copiedId === coupon.id ? (
                                                    <Check size={16} className="text-green-600" />
                                                ) : (
                                                    <Copy size={16} className="text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-800">{coupon.description}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getApplicableBadge(coupon.applicableTo)}`}>
                                            {coupon.applicableTo === 'new_users' ? 'New Users' : 
                                             coupon.applicableTo === 'members' ? 'Members Only' : 'All Users'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-800">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `KShs ${coupon.discountValue}`}
                                        </p>
                                        {coupon.minOrderAmount && (
                                            <p className="text-xs text-slate-500">Min: KShs {coupon.minOrderAmount}</p>
                                        )}
                                        {coupon.maxDiscount && (
                                            <p className="text-xs text-slate-500">Max: KShs {coupon.maxDiscount}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 w-24 bg-slate-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-slate-600">
                                                {coupon.usageCount}/{coupon.usageLimit}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">
                                            {new Date(coupon.endDate).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(coupon.status)}`}>
                                            {coupon.status === 'active' && <Check size={14} />}
                                            {coupon.status === 'disabled' && <X size={14} />}
                                            {coupon.status === 'expired' && <Calendar size={14} />}
                                            {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(coupon.id)}
                                                className={`p-2 rounded transition-colors ${
                                                    coupon.status === 'active' 
                                                        ? 'hover:bg-red-100 text-red-600' 
                                                        : 'hover:bg-green-100 text-green-600'
                                                }`}
                                                title={coupon.status === 'active' ? 'Disable' : 'Enable'}
                                            >
                                                {coupon.status === 'active' ? <X size={18} /> : <Check size={18} />}
                                            </button>
                                            <button
                                                className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredCoupons.length === 0 && (
                    <div className="text-center py-12">
                        <Percent className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No coupons found</p>
                    </div>
                )}
            </div>

            {/* Create Modal - Simplified */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Create New Coupon</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-slate-100 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-slate-500 mb-4">This is a demo. In production, this would open a full coupon creation form.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    alert('Demo: Coupon creation would happen here')
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
