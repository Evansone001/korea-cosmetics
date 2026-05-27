'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface AdminComment {
    id: string
    type: 'reseller_application' | 'store' | 'warehouse_purchase'
    status: string
    admin_comments: string
    rejection_reason?: string
    created_at: string
    updated_at: string
    name?: string
    order_number?: string
}

interface AdminCommentsProps {
    userId?: string
    storeId?: string
}

export default function AdminComments({ userId, storeId }: AdminCommentsProps) {
    const [comments, setComments] = useState<AdminComment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAdminComments = async () => {
        try {
            setLoading(true)
            setError(null)
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000'
            const token = localStorage.getItem('auth-token')
            
            // Fetch reseller application comments
            const resellerResponse = await fetch(`${backendUrl}/api/reseller-applications/my-application`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            const allComments: AdminComment[] = []
            
            if (resellerResponse.ok) {
                const resellerData = await resellerResponse.json()
                if (resellerData.application && resellerData.application.admin_comments) {
                    allComments.push({
                        id: resellerData.application.id,
                        type: 'reseller_application',
                        status: resellerData.application.status,
                        admin_comments: resellerData.application.admin_comments,
                        rejection_reason: resellerData.application.rejection_reason,
                        created_at: resellerData.application.created_at,
                        updated_at: resellerData.application.updated_at,
                        name: resellerData.application.business_name
                    })
                }
            }
            
            // Fetch store comments
            if (storeId) {
                const storeResponse = await fetch(`${backendUrl}/api/stores/${storeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                if (storeResponse.ok) {
                    const storeData = await storeResponse.json()
                    if (storeData.store && storeData.store.admin_comments) {
                        allComments.push({
                            id: storeData.store.id,
                            type: 'store',
                            status: storeData.store.status,
                            admin_comments: storeData.store.admin_comments,
                            rejection_reason: storeData.store.rejection_reason,
                            created_at: storeData.store.created_at,
                            updated_at: storeData.store.updated_at,
                            name: storeData.store.name
                        })
                    }
                }
            }
            
            // Fetch warehouse purchase comments
            const warehouseResponse = await fetch(`${backendUrl}/api/warehouse-purchases/my-purchases`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (warehouseResponse.ok) {
                const warehouseData = await warehouseResponse.json()
                if (warehouseData.purchases) {
                    warehouseData.purchases.forEach((purchase: any) => {
                        if (purchase.admin_comments) {
                            allComments.push({
                                id: purchase.id,
                                type: 'warehouse_purchase',
                                status: purchase.status,
                                admin_comments: purchase.admin_comments,
                                rejection_reason: purchase.rejection_reason,
                                created_at: purchase.created_at,
                                updated_at: purchase.updated_at,
                                order_number: purchase.order_number
                            })
                        }
                    })
                }
            }
            
            // Sort by updated_at descending
            allComments.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            
            setComments(allComments)
        } catch (err) {
            console.error('Failed to fetch admin comments:', err)
            setError('Failed to load admin comments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdminComments()
    }, [userId, storeId])

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'active':
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'rejected':
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'active':
            case 'delivered':
                return 'bg-green-50 border-green-200 text-green-800'
            case 'rejected':
            case 'cancelled':
                return 'bg-red-50 border-red-200 text-red-800'
            case 'pending':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800'
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reseller_application':
                return 'Reseller Application'
            case 'store':
                return 'Store Approval'
            case 'warehouse_purchase':
                return 'Warehouse Purchase'
            default:
                return type
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
            </div>
        )
    }

    if (comments.length === 0) {
        return (
            <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No admin comments yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{getTypeLabel(comment.type)}</span>
                            {comment.name && (
                                <span className="text-sm text-gray-500">- {comment.name}</span>
                            )}
                            {comment.order_number && (
                                <span className="text-sm text-gray-500">- {comment.order_number}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                                {comment.status}
                            </span>
                        </div>
                    </div>
                    
                    {comment.admin_comments && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900 mb-1">Admin Comment</p>
                                    <p className="text-sm text-blue-800">{comment.admin_comments}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {comment.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                                    <p className="text-sm text-red-800">{comment.rejection_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Last updated: {formatDate(comment.updated_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
