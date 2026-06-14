'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { Store, Package, FileText, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks'

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
    status: 'pending' | 'success' | 'error'
    progress: number
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
    const [isDragging, setIsDragging] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof ResellerApplicationData, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof ResellerApplicationData, boolean>>>({})
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAppSelector(state => state?.auth || { isAuthenticated: false, isLoading: true })

    const { user } = useAppSelector(state => state?.auth || { user: null })
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login?redirect=/apply-reseller')
            }
        }
    }, [isAuthenticated, authLoading, router])

    // If already has an application, redirect to status page
    // Admins don't need reseller application — redirect to store or create-store
    useEffect(() => {
        if (!isAuthenticated) return

        // Admins don't need to apply for reseller status
        if (isAdmin) {
            router.push('/create-store')
            return
        }

        const checkExisting = async () => {
            try {
                const response: any = await apiClient.getMyResellerApplication()
                if (response.application) {
                    if (response.application.status === 'approved') {
                        try {
                            const storeRes: any = await apiClient.getMyStore()
                            router.push(storeRes?.store ? '/store' : '/create-store')
                        } catch {
                            router.push('/create-store')
                        }
                    } else {
                        router.push('/reseller-application-status')
                    }
                }
            } catch {
                // No application — allow access to form
            }
        }
        checkExisting()
    }, [isAuthenticated, isAdmin, router])

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render form if not authenticated
    if (!isAuthenticated) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate all fields
        const newErrors: Partial<Record<keyof ResellerApplicationData, string>> = {}
        Object.keys(formData).forEach((key) => {
            const fieldKey = key as keyof ResellerApplicationData
            const error = validateField(fieldKey, formData[fieldKey])
            if (error) newErrors[fieldKey] = error
        })
        
        setErrors(newErrors)
        setTouched(
            Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Partial<Record<keyof ResellerApplicationData, boolean>>)
        )
        
        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors before submitting')
            return
        }
        
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
                // Redirect to application status page
                router.push('/reseller-application-status')
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
            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024
            if (file.size > maxSize) {
                toast.error('File size exceeds 10MB limit')
                return
            }
            const newDoc = {
                id: Date.now().toString(),
                file: file,
                name: file.name,
                type: 'business_license',
                status: 'pending' as const,
                progress: 0
            }
            setDocuments(prev => [...prev, newDoc])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024
            if (file.size > maxSize) {
                toast.error('File size exceeds 10MB limit')
                return
            }
            // Validate file type
            const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
            if (!validTypes.includes(fileExtension)) {
                toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG files.')
                return
            }
            const newDoc = {
                id: Date.now().toString(),
                file: file,
                name: file.name,
                type: 'business_license',
                status: 'pending' as const,
                progress: 0
            }
            setDocuments(prev => [...prev, newDoc])
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        switch (ext) {
            case 'pdf':
                return <FileText size={20} className="text-red-500" />
            case 'doc':
            case 'docx':
                return <FileText size={20} className="text-blue-500" />
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <FileText size={20} className="text-green-500" />
            default:
                return <FileText size={20} className="text-slate-500" />
        }
    }

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index))
    }

    const validateField = (name: keyof ResellerApplicationData, value: string | number) => {
        const strValue = String(value).trim()
        
        switch (name) {
            case 'business_name':
                if (!strValue) return 'Business name is required'
                if (strValue.length < 2) return 'Business name must be at least 2 characters'
                return ''
            case 'business_email':
                if (!strValue) return 'Business email is required'
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(strValue)) return 'Please enter a valid email address'
                return ''
            case 'business_phone':
                if (strValue && !/^[+]?[\d\s-()]+$/.test(strValue)) {
                    return 'Please enter a valid phone number'
                }
                return ''
            case 'business_address':
                if (!strValue) return 'Business address is required'
                if (strValue.length < 5) return 'Please enter a complete address'
                return ''
            case 'business_city':
                if (!strValue) return 'City is required'
                return ''
            case 'business_country':
                if (!strValue) return 'Country is required'
                return ''
            case 'business_description':
                if (!strValue) return 'Business description is required'
                if (strValue.length < 10) return 'Please provide a more detailed description (min 10 characters)'
                return ''
            case 'website_url':
                if (strValue && !/^https?:\/\/.+/.test(strValue)) {
                    return 'Please enter a valid URL (e.g., https://example.com)'
                }
                return ''
            default:
                return ''
        }
    }

    const handleFieldChange = (name: keyof ResellerApplicationData, value: string | number) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
        }
    }

    const handleFieldBlur = (name: keyof ResellerApplicationData, value: string | number) => {
        setTouched(prev => ({ ...prev, [name]: true }))
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
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

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Business Information Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Store className="text-pink-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900">Business Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.business_name}
                                            onChange={(e) => handleFieldChange('business_name', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('business_name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                errors.business_name
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                            }`}
                                            required
                                        />
                                        {errors.business_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.business_description}
                                            onChange={(e) => handleFieldChange('business_description', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('business_description', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                                errors.business_description
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                            }`}
                                            rows={4}
                                            required
                                        />
                                        {errors.business_description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.business_description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.business_phone}
                                            onChange={(e) => handleFieldChange('business_phone', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('business_phone', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                errors.business_phone
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                            }`}
                                        />
                                        {errors.business_phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.business_phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.business_email}
                                            onChange={(e) => handleFieldChange('business_email', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('business_email', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                errors.business_email
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                            }`}
                                            required
                                        />
                                        {errors.business_email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.business_email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="border-t border-slate-200 pt-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Package className="text-pink-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900">Business Address</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.business_address}
                                            onChange={(e) => handleFieldChange('business_address', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('business_address', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                                errors.business_address
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                            }`}
                                            rows={3}
                                            required
                                        />
                                        {errors.business_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.business_address}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.business_city}
                                                onChange={(e) => handleFieldChange('business_city', e.target.value)}
                                                onBlur={(e) => handleFieldBlur('business_city', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                    errors.business_city
                                                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                        : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                                }`}
                                                required
                                            />
                                            {errors.business_city && (
                                                <p className="mt-1 text-sm text-red-600">{errors.business_city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.business_country}
                                                onChange={(e) => handleFieldChange('business_country', e.target.value)}
                                                onBlur={(e) => handleFieldBlur('business_country', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                    errors.business_country
                                                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                        : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                                }`}
                                                required
                                            />
                                            {errors.business_country && (
                                                <p className="mt-1 text-sm text-red-600">{errors.business_country}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details Section */}
                            <div className="border-t border-slate-200 pt-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="text-pink-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900">Additional Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tax ID
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tax_id}
                                            onChange={(e) => handleFieldChange('tax_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business License
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.business_license}
                                            onChange={(e) => handleFieldChange('business_license', e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Years in Business
                                        </label>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    value={formData.years_in_business}
                                                    onChange={(e) => handleFieldChange('years_in_business', parseInt(e.target.value))}
                                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                    min="0"
                                                    max="50"
                                                    step="1"
                                                />
                                                <div className="min-w-[80px] text-center">
                                                    <span className="text-2xl font-bold text-pink-600">{formData.years_in_business}</span>
                                                    <span className="text-sm text-slate-600 ml-1">{formData.years_in_business === 1 ? 'year' : 'years'}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 px-1">
                                                <span>0</span>
                                                <span>5</span>
                                                <span>10</span>
                                                <span>20</span>
                                                <span>30+</span>
                                                <span>50+</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Website URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website_url}
                                            onChange={(e) => handleFieldChange('website_url', e.target.value)}
                                            onBlur={(e) => handleFieldBlur('website_url', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                errors.website_url
                                                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                                    : 'border-slate-300 focus:ring-pink-500 focus:border-pink-500'
                                            }`}
                                            placeholder="https://"
                                        />
                                        {errors.website_url && (
                                            <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload Section */}
                            <div className="border-t border-slate-200 pt-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="text-pink-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900">Supporting Documents</h2>
                                </div>
                                <p className="text-slate-600 mb-6">
                                    Upload business license, tax certificates, or other supporting documents to verify your business.
                                </p>
                                
                                {/* Drag and Drop Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                                        isDragging
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-slate-300 hover:border-pink-400 hover:bg-slate-50'
                                    }`}
                                >
                                    <Upload size={48} className={`mx-auto mb-4 ${isDragging ? 'text-pink-500' : 'text-slate-400'}`} />
                                    <p className="text-slate-700 font-medium mb-2">
                                        Drag and drop files here, or click to browse
                                    </p>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
                                    </p>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleDocumentUpload}
                                        className="hidden"
                                        id="file-upload"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="inline-block px-6 py-2 bg-pink-500 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-colors font-medium"
                                    >
                                        Choose Files
                                    </label>
                                </div>
                                
                                {/* Document List */}
                                {documents.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <h3 className="text-sm font-medium text-slate-700">Uploaded Files</h3>
                                        {documents.map((doc, index) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-pink-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    {getFileIcon(doc.name)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                                        <p className="text-xs text-slate-500">{formatFileSize(doc.file.size)}</p>
                                                    </div>
                                                    {doc.status === 'pending' && (
                                                        <span className="text-xs text-yellow-600 font-medium">Pending</span>
                                                    )}
                                                    {doc.status === 'success' && (
                                                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle size={12} />
                                                            Uploaded
                                                        </span>
                                                    )}
                                                    {doc.status === 'error' && (
                                                        <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            Error
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove file"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                                {/* Submit Button */}
                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Submitting application...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit Application</span>
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Error Display */}
                                {submitError && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
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
