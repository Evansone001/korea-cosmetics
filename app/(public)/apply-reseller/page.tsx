'use client'
import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { Store, Package, FileText, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface ResellerApplicationData {
    business_name: string
    business_description: string
    business_phone: string
    business_email: string
    business_address: string
    business_city: string
    business_country: string
    tax_id: string
    business_license: string
    years_in_business: number
    website_url: string
}

interface Document {
    id: string
    file: File
    name: string
    type: string
}

export default function ApplyReseller() {
    const [formData, setFormData] = useState<ResellerApplicationData>({
        business_name: '',
        business_description: '',
        business_phone: '',
        business_email: '',
        business_address: '',
        business_city: '',
        business_country: '',
        tax_id: '',
        business_license: '',
        years_in_business: 0,
        website_url: '',
    })
    const [documents, setDocuments] = useState<Document[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Submit application first to get applicationId
            const response = await apiClient.createResellerApplication(formData)
            
            if (!response.application?.id) {
                throw new Error('Failed to create reseller application')
            }
            
            // Upload documents with applicationId
            const documentPromises = documents.map((doc, index) => 
                apiClient.uploadResellerDocument(
                    response.application.id, 
                    doc.file, 
                    `document_${index + 1}`
                )
            )
            
            await Promise.all(documentPromises)
            
            if (response.application) {
                toast.success('Reseller application submitted successfully!')
                // Redirect to store creation after approval
                router.push('/create-store')
            } else {
                setSubmitError(response.error || 'Failed to submit application')
                toast.error('Failed to submit reseller application')
            }
        } catch (error: any) {
            console.error('Application submission error:', error)
            setSubmitError('Failed to submit application. Please try again.')
            toast.error('Failed to submit reseller application')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const newDoc = {
                id: Date.now().toString(),
                file: file,
                name: file.name,
                type: 'business_license' // Default type
            }
            setDocuments(prev => [...prev, newDoc])
        }
    }

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Apply to Become a Reseller
                            </h1>
                            <p className="text-slate-600 mb-6">
                                Join our reseller program and expand your business reach. Complete the form below to apply for reseller status.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Business Description *
                                    </label>
                                    <textarea
                                        value={formData.business_description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.business_phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, business_phone: e.target.value }))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.business_email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, business_email: e.target.value }))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Address *
                                        </label>
                                        <textarea
                                            value={formData.business_address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, business_address: e.target.value }))}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.business_city}
                                                onChange={(e) => setFormData(prev => ({ ...prev, business_city: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.business_country}
                                                onChange={(e) => setFormData(prev => ({ ...prev, business_country: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Tax ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.tax_id}
                                                onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Business License *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.business_license}
                                                onChange={(e) => setFormData(prev => ({ ...prev, business_license: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Years in Business
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.years_in_business}
                                                onChange={(e) => setFormData(prev => ({ ...prev, years_in_business: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Website URL
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.website_url}
                                                onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="https://"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload Section */}
                            <div className="mt-8">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Supporting Documents</h2>
                                    <p className="text-slate-600 mb-6">
                                        Upload business license, tax certificates, or other supporting documents to verify your business.
                                    </p>
                                    
                                <div className="space-y-4">
                                    {documents.map((doc, index) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-pink-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                                                    <p className="text-xs text-slate-500">({Math.round(doc.file.size / 1024)} KB)</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                    
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Upload Additional Documents
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleDocumentUpload}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                                                <span className="ml-3">Submitting application...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <CheckCircle size={20} className="mr-2" />
                                                Submit Application
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Error Display */}
                                {submitError && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle size={20} className="text-red-500" />
                                            <div>
                                                <h4 className="font-semibold text-red-800">Submission Error</h4>
                                                <p className="text-red-600">{submitError}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    
    )
}
