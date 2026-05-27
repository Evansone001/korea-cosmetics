'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { Store, Clock, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks'

export default function ResellerApplicationStatus() {
    const [application, setApplication] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAppSelector(state => state?.auth || { isAuthenticated: false, isLoading: true })

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login?redirect=/reseller-application-status')
            }
        }
    }, [isAuthenticated, authLoading, router])

    const fetchApplicationStatus = async () => {
        try {
            setRefreshing(true)
            const response: any = await apiClient.getMyResellerApplication()
            setApplication(response.application)
        } catch (error: any) {
            console.error('Failed to fetch application status:', error)
            if (error.message && !error.message.includes('404')) {
                toast.error('Failed to fetch application status')
            }
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchApplicationStatus()
        }
    }, [isAuthenticated])

    const handleRefresh = () => {
        fetchApplicationStatus()
    }

    // Show loading state while checking authentication
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null
    }

    // No application found - redirect to apply
    if (!application) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="w-10 h-10 text-pink-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Application Found</h2>
                        <p className="text-slate-600 mb-6">You haven't submitted a reseller application yet.</p>
                        <button
                            onClick={() => router.push('/apply-reseller')}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                        >
                            Apply to Become a Reseller
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const getStatusIcon = () => {
        switch (application.status) {
            case 'pending':
                return <Clock className="w-16 h-16 text-yellow-500" />
            case 'approved':
                return <CheckCircle className="w-16 h-16 text-green-500" />
            case 'rejected':
                return <XCircle className="w-16 h-16 text-red-500" />
            default:
                return <Clock className="w-16 h-16 text-slate-400" />
        }
    }

    const getStatusTitle = () => {
        switch (application.status) {
            case 'pending':
                return 'Application Pending'
            case 'approved':
                return 'Application Approved!'
            case 'rejected':
                return 'Application Rejected'
            default:
                return 'Unknown Status'
        }
    }

    const getStatusMessage = () => {
        switch (application.status) {
            case 'pending':
                return 'Your reseller application is being reviewed by our team. This typically takes 1-3 business days. You will be notified once a decision is made.'
            case 'approved':
                return 'Congratulations! Your reseller application has been approved. You can now proceed to create your store.'
            case 'rejected':
                return `Your application was not approved. ${application.rejection_reason || 'Please review the requirements and submit a new application.'}`
            default:
                return 'Unable to determine application status.'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Status Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                            {getStatusIcon()}
                        </div>
                    </div>

                    {/* Status Title */}
                    <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                        {getStatusTitle()}
                    </h1>

                    {/* Status Message */}
                    <p className="text-slate-600 text-center mb-8">
                        {getStatusMessage()}
                    </p>

                    {/* Application Details */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Business Name:</span>
                                <span className="font-medium text-slate-900">{application.business_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Business Email:</span>
                                <span className="font-medium text-slate-900">{application.business_email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Submitted On:</span>
                                <span className="font-medium text-slate-900">
                                    {new Date(application.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {application.approved_at && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Approved On:</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(application.approved_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {application.rejected_at && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Rejected On:</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(application.rejected_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Comments */}
                    {application.admin_comments && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                            <h4 className="font-semibold text-blue-900 mb-2">Admin Comments</h4>
                            <p className="text-blue-800">{application.admin_comments}</p>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {application.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                            <h4 className="font-semibold text-red-900 mb-2">Reason for Rejection</h4>
                            <p className="text-red-800">{application.rejection_reason}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {application.status === 'pending' && (
                            <>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all text-slate-700"
                                >
                                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                                    Refresh Status
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all text-slate-700"
                                >
                                    Back to Home
                                </button>
                            </>
                        )}

                        {application.status === 'approved' && (
                            <button
                                onClick={() => router.push('/create-store')}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
                            >
                                Create Your Store
                                <ArrowRight size={18} />
                            </button>
                        )}

                        {application.status === 'rejected' && (
                            <>
                                <button
                                    onClick={() => router.push('/apply-reseller')}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
                                >
                                    Submit New Application
                                    <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all text-slate-700"
                                >
                                    Back to Home
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
