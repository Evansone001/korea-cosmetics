'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState, FormEvent, ChangeEvent } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { Store, ArrowRight, Link } from 'lucide-react'

interface StoreInfo {
    name: string;
    username: string;
    description: string;
    email: string;
    contact: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    image: string | File;
    business_documents: File[];
    identity_documents: File[];
}

export default function CreateStore() {
    const router = useRouter()
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [storeInfo, setStoreInfo] = useState<StoreInfo>({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        image: "",
        business_documents: [],
        identity_documents: []
    })

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setStoreInfo({ ...storeInfo, phone: e.target.value })
    }

    const handleDocumentUpload = (e: ChangeEvent<HTMLInputElement>, documentType: 'business' | 'identity') => {
        const files = e.target.files
        if (!files) return

        const fileArray = Array.from(files)
        const validFiles: File[] = []

        // Validate each file
        fileArray.forEach(file => {
            // Check file type (PDF only)
            if (file.type !== 'application/pdf') {
                toast.error(`${file.name} is not a PDF file`)
                return
            }

            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit`)
                return
            }

            validFiles.push(file)
        })

        if (validFiles.length > 0) {
            const fieldName = documentType === 'business' ? 'business_documents' : 'identity_documents'
            setStoreInfo({
                ...storeInfo,
                [fieldName]: [...storeInfo[fieldName], ...validFiles]
            })
            toast.success(`${validFiles.length} document(s) added`)
        }
    }

    const removeDocument = (index: number, documentType: 'business' | 'identity') => {
        const fieldName = documentType === 'business' ? 'business_documents' : 'identity_documents'
        const updatedDocuments = [...storeInfo[fieldName]]
        updatedDocuments.splice(index, 1)
        setStoreInfo({
            ...storeInfo,
            [fieldName]: updatedDocuments
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const fetchSellerStatus = async () => {
        try {
            // First check if user is authenticated
            await apiClient.getCurrentUser()

            // Check if user has approved reseller application
            try {
                const resellerResponse: any = await apiClient.getMyResellerApplication()
                if (resellerResponse.application) {
                    if (resellerResponse.application.status !== 'approved') {
                        // User has pending or rejected reseller application
                        setAlreadySubmitted(true)
                        setStatus(resellerResponse.application.status)
                        if (resellerResponse.application.status === 'pending') {
                            setMessage("Your reseller application is pending approval. You can create a store after your application is approved.")
                        } else if (resellerResponse.application.status === 'rejected') {
                            setMessage(`Your reseller application was rejected. ${resellerResponse.application.rejection_reason || 'Please submit a new application.'}`)
                        }
                        setLoading(false)
                        return
                    }
                    // Reseller application is approved, proceed to check store
                }
            } catch (resellerError: any) {
                // No reseller application found - redirect to apply
                if (!resellerError.message || !resellerError.message.includes('404')) {
                    console.error('Error checking reseller application:', resellerError)
                }
                setAlreadySubmitted(true)
                setStatus('no_reseller')
                setMessage("You need to apply for reseller status before creating a store.")
                setLoading(false)
                return
            }

            // Then check if store exists
            const response: any = await apiClient.getMyStore()
            if (response.store) {
                setAlreadySubmitted(true)
                setStatus(response.store.status)
                if (response.store.status === 'pending') {
                    setMessage("Your store application has been submitted and is awaiting admin approval.")
                } else if (response.store.status === 'active') {
                    setMessage("Your store is already approved and active!")
                    setTimeout(() => router.push('/store'), 3000)
                } else if (response.store.status === 'inactive' && response.store.rejection_reason) {
                    setMessage(`Your previous application was rejected. Reason: ${response.store.rejection_reason}`)
                }
            }
        } catch (error: any) {
            // If 401 error, redirect to login
            if (error.message && error.message.includes('401')) {
                toast.error('Please log in to create a store')
                router.push('/login')
                return
            }
            // No store found - allow creation
            console.log('No existing store found, allowing creation')
        } finally {
            setLoading(false)
        }
    }

    const onSubmitHandler = async (e: FormEvent) => {
        e.preventDefault()

        // Validation
        if (!storeInfo.name || !storeInfo.username || !storeInfo.description || !storeInfo.email) {
            toast.error("Please fill in all required fields")
            return
        }

        if (!storeInfo.address_line1 || !storeInfo.city || !storeInfo.state || !storeInfo.postal_code || !storeInfo.country) {
            toast.error("Please provide complete address information (city, state, postal code, and country)")
            return
        }

        if (storeInfo.country.length !== 2) {
            toast.error("Country must be a 2-letter code (e.g., KE, US, UK)")
            return
        }

        if (storeInfo.description.length < 10) {
            toast.error("Description must be at least 10 characters long")
            return
        }

        setIsSubmitting(true)

        try {
            // Create store first
            const response = await apiClient.createStore({
                name: storeInfo.name,
                username: storeInfo.username,
                description: storeInfo.description,
                email: storeInfo.email,
                phone: storeInfo.contact,
                address_line1: storeInfo.address_line1,
                address_line2: storeInfo.address_line2,
                city: storeInfo.city,
                state: storeInfo.state,
                postal_code: storeInfo.postal_code,
                country: storeInfo.country
            })

            // Upload documents if any
            const allDocuments = [
                ...storeInfo.business_documents.map(file => ({ file, type: 'business' as const })),
                ...storeInfo.identity_documents.map(file => ({ file, type: 'identity' as const }))
            ]

            if (allDocuments.length > 0) {
                toast.loading(`Uploading ${allDocuments.length} document(s)...`)

                let uploadedCount = 0
                let failedCount = 0

                for (const doc of allDocuments) {
                    try {
                        await apiClient.uploadStoreDocument(doc.file, doc.type)
                        uploadedCount++
                    } catch (error: any) {
                        console.error('Failed to upload document:', doc.file.name, error)
                        failedCount++
                    }
                }

                toast.dismiss()

                if (uploadedCount > 0) {
                    toast.success(`${uploadedCount} document(s) uploaded successfully`)
                }
                if (failedCount > 0) {
                    toast.error(`${failedCount} document(s) failed to upload`)
                }
            }

            toast.success("Store application submitted successfully!")
            setAlreadySubmitted(true)
            setStatus('pending')
            setMessage("Your store application has been submitted and is awaiting admin approval. You'll be notified once approved.")

        } catch (error: any) {
            console.error('Failed to create store:', error)

            // Handle 401 authentication errors
            if (error.message && error.message.includes('401')) {
                toast.error('Please log in to create a store')
                router.push('/login')
                return
            }

            // Handle validation errors with user-friendly messages
            if (error.message && error.message.includes('Validation error')) {
                try {
                    // Extract validation details from error message
                    const detailsMatch = error.message.match(/Validation error: (.+)/);
                    if (detailsMatch) {
                        const details = JSON.parse(detailsMatch[1]);

                        // Convert validation details to user-friendly messages
                        Object.entries(details).forEach(([field, messages]: [string, any]) => {
                            const fieldLabels: Record<string, string> = {
                                name: 'Store name',
                                username: 'Username',
                                description: 'Description',
                                email: 'Email',
                                phone: 'Phone number',
                                address_line1: 'Address line 1',
                                city: 'City',
                                state: 'State/Province',
                                postal_code: 'Postal code',
                                country: 'Country code'
                            };

                            const label = fieldLabels[field] || field;
                            const message = Array.isArray(messages) ? messages[0] : messages;

                            // Convert technical messages to user-friendly ones
                            let friendlyMessage = message;
                            if (message.includes('Shorter than')) {
                                friendlyMessage = `${label} is too short`;
                            } else if (message.includes('Longer than')) {
                                friendlyMessage = `${label} is too long`;
                            } else if (message.includes('Not a valid email')) {
                                friendlyMessage = 'Please enter a valid email address';
                            } else if (message.includes('2 letters')) {
                                friendlyMessage = 'Country must be a 2-letter code (e.g., KE, US, UK)';
                            } else if (message.includes('already exists')) {
                                friendlyMessage = `${label} is already taken`;
                            } else if (message.includes('already registered')) {
                                friendlyMessage = 'This email is already registered';
                            }

                            toast.error(friendlyMessage);
                        });
                    } else {
                        toast.error("Please check your input and try again");
                    }
                } catch (e) {
                    toast.error(error.message || "Failed to submit store application");
                }
            } else {
                toast.error(error.message || "Failed to submit store application");
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        fetchSellerStatus()
    }, [])

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={onSubmitHandler} className="max-w-3xl mx-auto flex flex-col items-start gap-4 text-slate-600">
                        {/* Title */}
                        <div className="mb-4">
                            <h1 className="text-3xl text-slate-800 font-medium">Add Your Store</h1>
                            <p className="max-w-lg mt-2 text-slate-500">To become a seller on KoreaCosmetics' Hub, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        {/* Logo Upload */}
                        <label className="cursor-pointer w-full max-w-lg">
                            <span className="font-medium text-slate-700">Store Logo</span>
                            <Image src={storeInfo.image instanceof File ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="rounded-lg mt-2 h-24 w-auto object-cover" alt="" width={200} height={150} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files?.[0] || "" })} hidden />
                        </label>

                        {/* Basic Info */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="font-medium text-slate-700">Store Username <span className="text-red-500">*</span></label>
                                <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="@yourstore" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Store Name <span className="text-red-500">*</span></label>
                                <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Your Store Name" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                        </div>

                        <div className="w-full">
                            <label className="font-medium text-slate-700">Store Description <span className="text-red-500">*</span></label>
                            <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={4} placeholder="Describe your store and what you sell..." className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1 resize-none" />
                        </div>

                        {/* Contact Info */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
                                <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="store@example.com" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Contact Number</label>
                                <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="+254 7XX XXX XXX" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="w-full">
                            <label className="font-medium text-slate-700">Address Line 1 <span className="text-red-500">*</span></label>
                            <input name="address_line1" onChange={onChangeHandler} value={storeInfo.address_line1} type="text" placeholder="Street address" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                        </div>

                        <div className="w-full">
                            <label className="font-medium text-slate-700">Address Line 2</label>
                            <input name="address_line2" onChange={onChangeHandler} value={storeInfo.address_line2} type="text" placeholder="Apartment, suite, etc. (optional)" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                        </div>

                        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="font-medium text-slate-700">City <span className="text-red-500">*</span></label>
                                <input name="city" onChange={onChangeHandler} value={storeInfo.city} type="text" placeholder="City" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">State/Province <span className="text-red-500">*</span></label>
                                <input name="state" onChange={onChangeHandler} value={storeInfo.state} type="text" placeholder="State" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Postal Code <span className="text-red-500">*</span></label>
                                <input name="postal_code" onChange={onChangeHandler} value={storeInfo.postal_code} type="text" placeholder="Postal Code" className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Country Code <span className="text-red-500">*</span></label>
                                <input name="country" onChange={onChangeHandler} value={storeInfo.country} type="text" placeholder="KE" maxLength={2} className="border border-slate-300 outline-slate-400 w-full p-2.5 rounded-lg mt-1" />
                                <p className="text-xs text-slate-400 mt-1">2-letter code (e.g., KE, US, UK)</p>
                            </div>
                            {storeInfo.business_documents.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {storeInfo.business_documents.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-pink-600 text-xs font-medium">PDF</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(index, 'business')}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-full mt-8">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Identity Documents (Optional)</h3>
                            <p className="text-slate-500 text-sm mb-4">Upload national ID, passport, or KRA PIN certificate. PDF only, max 5MB per file.</p>

                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={(e) => handleDocumentUpload(e, 'identity')}
                                    className="hidden"
                                />
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-pink-500 transition-colors">
                                    <p className="text-slate-600">Click to upload or drag and drop</p>
                                    <p className="text-slate-400 text-sm mt-1">PDF files, max 5MB each</p>
                                </div>
                            </label>

                            {storeInfo.identity_documents.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {storeInfo.identity_documents.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-pink-600 text-xs font-medium">PDF</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(index, 'identity')}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-12 py-3 rounded-xl mt-6 mb-20 active:scale-95 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Application
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
                    <div className="text-center max-w-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="w-10 h-10 text-pink-500" />
                        </div>
                        <p className="sm:text-2xl lg:text-3xl font-semibold text-slate-700 text-center mb-4">{message}</p>
                        {status === "no_reseller" && (
                            <div className="mt-6">
                                <Link href="/apply-reseller" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
                                    Apply for Reseller Status
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        )}
                        {(status === "pending" || status === "rejected") && (
                            <div className="mt-6">
                                <Link href="/reseller-application-status" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
                                    View Application Status
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        )}
                        {status === "active" && (
                            <div className="mt-6">
                                <p className="text-slate-500 mb-4">Your store is already active!</p>
                                <Link href="/store" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium">
                                    Go to Store Dashboard
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    ) : (<Loading />)
}
