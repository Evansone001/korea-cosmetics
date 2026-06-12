'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Loader2, Check, AlertCircle, Eye } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import CategorySelector from './CategorySelector'

interface ProductFormData {
  name: string
  description: string
  price: number
  mrp?: number
  category: string
  brand?: string
  manufacturer?: string
  origin?: string
  stock_quantity?: number
  size?: string
  formula?: string
  how_to_use?: string
  key_benefits?: string
  key_ingredients?: string
  skin_types?: string
  skin_concerns?: string
  texture?: string
  suggested_retail_price?: number
  minimum_selling_price?: number
  logistics_mode?: string
  tax_rate?: number
  requires_license?: boolean
  storage_requirements?: string
  images?: string[]
  categories?: string[]
  subcategories?: string[]
  // Warehouse and pricing fields
  warehouse_stock?: number
  b2c_retail_price?: number
  b2b_wholesale_price?: number
  b2b_moq?: number
  customer_type?: 'B2C' | 'B2B' | 'BOTH'
  is_warehouse_product?: boolean
  added_by_admin?: boolean
  status?: 'active' | 'inactive' | 'draft'
  featured?: boolean
  meta_title?: string
  meta_description?: string
}

interface FormValidation {
  [fieldName: string]: {
    isValid: boolean
    message: string
    hint?: string
  }
}

interface DraftData {
  formData: ProductFormData
  timestamp: number
  version: number
}

interface ProductFormProps {
  existingProduct?: any
  onSave?: (productData: any) => void
  onCancel?: () => void
  isModal?: boolean
}

export default function ProductForm({ existingProduct, onSave, onCancel, isModal = false }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: undefined as unknown as number,
    category: '',
    brand: '',
    manufacturer: '',
    origin: 'South Korea',
    stock_quantity: undefined,
    size: '',
    formula: '',
    how_to_use: '',
    key_benefits: '',
    key_ingredients: '',
    skin_types: '',
    skin_concerns: '',
    texture: '',
    suggested_retail_price: undefined,
    minimum_selling_price: undefined,
    logistics_mode: 'WAREHOUSE_TO_STORE',
    tax_rate: undefined,
    requires_license: false,
    storage_requirements: '',
    images: [],
    categories: [],
    subcategories: [],
    // Warehouse and pricing fields
    warehouse_stock: undefined,
    b2c_retail_price: undefined,
    b2b_wholesale_price: undefined,
    b2b_moq: undefined,
    customer_type: 'BOTH',
    is_warehouse_product: true,
    added_by_admin: true,
    status: 'draft',
    featured: false,
    meta_title: '',
    meta_description: ''
  })
  
  // Industrial UX states
  const [validation, setValidation] = useState<FormValidation>({})
  const [draftSaved, setDraftSaved] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showSEO, setShowSEO] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const response: any = await apiClient.getCategoriesHierarchical()
      setCategories(response.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Load existing product data if editing
  useEffect(() => {
    if (existingProduct) {
      setFormData({
        ...formData,
        name: existingProduct.name || '',
        description: existingProduct.description || '',
        price: existingProduct.price || 0,
        mrp: existingProduct.mrp || 0,
        category: existingProduct.category || '',
        brand: existingProduct.brand || '',
        manufacturer: existingProduct.manufacturer || '',
        origin: existingProduct.origin || 'South Korea',
        stock_quantity: existingProduct.stock_quantity || 0,
        size: existingProduct.size || '',
        formula: existingProduct.formula || '',
        how_to_use: existingProduct.how_to_use || '',
        key_benefits: existingProduct.key_benefits || '',
        key_ingredients: existingProduct.key_ingredients || '',
        skin_types: existingProduct.skin_types || '',
        skin_concerns: existingProduct.skin_concerns || '',
        texture: existingProduct.texture || '',
        images: existingProduct.images || [],
        warehouse_stock: existingProduct.warehouse_stock || 0,
        b2c_retail_price: existingProduct.b2c_retail_price || 0,
        b2b_wholesale_price: existingProduct.b2b_wholesale_price || 0,
        b2b_moq: existingProduct.b2b_moq || 1,
        customer_type: existingProduct.customer_type || 'BOTH',
        is_warehouse_product: existingProduct.is_warehouse_product || true,
        added_by_admin: existingProduct.added_by_admin || true,
        status: existingProduct.status || 'draft',
        featured: existingProduct.featured || false,
        meta_title: existingProduct.meta_title || '',
        meta_description: existingProduct.meta_description || ''
      })
      setImages(existingProduct.images || [])
    }
  }, [existingProduct])

  const validateField = useCallback((name: string, value: any) => {
    switch (name) {
      case 'name':
        return {
          isValid: value && value.trim().length >= 3,
          message: value && value.trim().length >= 3 ? '' : 'Product name must be at least 3 characters',
          hint: 'Use descriptive names like "Premium Anti-Aging Serum"'
        }
      case 'description':
        return {
          isValid: value && value.trim().length >= 20,
          message: value && value.trim().length >= 20 ? '' : 'Description must be at least 20 characters',
          hint: 'Include key benefits, ingredients, and usage instructions'
        }
      case 'price':
        return {
          isValid: value && !isNaN(value) && value > 0,
          message: value && !isNaN(value) && value > 0 ? '' : 'Price must be a valid positive number',
          hint: 'Research competitor pricing for market positioning'
        }
      case 'category':
        return {
          isValid: value && value.trim().length > 0,
          message: value && value.trim().length > 0 ? '' : 'Please select a category',
          hint: 'Choose the most appropriate category for your product'
        }
      default:
        return {
          isValid: true,
          message: ''
        }
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const fieldValue = type === 'number'
      ? (value === '' ? undefined : parseFloat(value))
      : type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))
    
    // Validate field
    const fieldValidation = validateField(name, fieldValue)
    setValidation(prev => ({
      ...prev,
      [name]: fieldValidation
    }))
    
    setUnsavedChanges(true)
  }, [validateField])
  
  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const requiredFields = ['name', 'description', 'price', 'category']
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof ProductFormData]
      return value !== undefined && value !== null && value !== '' && value !== 0
    }).length
    
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData])
  
  // Update progress when form data changes
  useEffect(() => {
    const progress = calculateProgress()
    setFormProgress(progress)
  }, [formData, calculateProgress])

  // Enhanced image upload with progress tracking
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Check authentication before upload
    const authToken = localStorage.getItem('auth-token') || 
                      document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]
    
    if (!authToken) {
      toast.error('You must be logged in to upload images', { id: 'auth-error' })
      return
    }

    setUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        try {
          toast.loading(`Uploading image ${index + 1}/${files.length}...`, { id: `upload-${index}` })
          const response = await apiClient.uploadProductImage(file)
          
          toast.success(`Image ${index + 1} uploaded successfully`, { id: `upload-${index}` })
          return response.url
        } catch (error: any) {
          console.error(`Failed to upload image ${index + 1}:`, error)
          toast.error(`Failed to upload image ${index + 1}: ${error.response?.data?.error || error.message || 'Unknown error'}`, { id: `upload-${index}` })
          return null
        }
      })
      
      const uploadedUrls = await Promise.all(uploadPromises)
      const successfulUploads = uploadedUrls.filter(url => url !== null)
      
      if (successfulUploads.length > 0) {
        setImages(prev => [...prev, ...successfulUploads])
        toast.success(`${successfulUploads.length} of ${files.length} images uploaded successfully`)
        setUnsavedChanges(true) // Mark form as having unsaved changes
      }
      
      if (successfulUploads.length === 0) {
        toast.error('Failed to upload any images')
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [])

  // Auto-save functionality
  const saveDraft = useCallback(() => {
    const draftData: DraftData = {
      formData: { ...formData },
      timestamp: Date.now(),
      version: 1
    }
    
    try {
      localStorage.setItem('product-create-draft', JSON.stringify(draftData))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast.error('Failed to save draft')
    }
  }, [formData])
  
  // Restore draft on mount
  useEffect(() => {
    if (!existingProduct) {
      try {
        const savedDraft = localStorage.getItem('product-create-draft')
        if (savedDraft) {
          const draftData: DraftData = JSON.parse(savedDraft)
          
          // Only restore if draft is recent (within 24 hours)
          if (Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000) {
            setFormData(draftData.formData)
            setImages(draftData.formData.images || [])
            toast.success('Draft restored!')
            setUnsavedChanges(false)
          }
        }
      } catch (error) {
        console.error('Failed to restore draft:', error)
      }
    }
  }, [existingProduct])
  
  // Auto-save on form changes
  useEffect(() => {
    if (unsavedChanges) {
      const timer = setTimeout(() => {
        saveDraft()
      }, 5000) // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timer)
    }
  }, [unsavedChanges, saveDraft])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Comprehensive validation
    const requiredFields = ['name', 'description', 'price', 'category']
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof ProductFormData]
      return !value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value <= 0)
    })
    
    // Admin-specific business logic validation
    if (formData.minimum_selling_price && formData.minimum_selling_price >= formData.price) {
      setValidation(prev => ({
        ...prev,
        minimum_selling_price: { isValid: false, message: 'Must be less than regular price' }
      }))
      return
    }
    
    if (missingFields.length > 0) {
      missingFields.forEach(field => {
        setValidation(prev => ({
          ...prev,
          [field]: { isValid: false, message: 'This field is required' }
        }))
      })
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        ...formData,
        images: images.length > 0 ? images : undefined
      }

      // Helper: convert a comma-separated textarea string to a trimmed array (or null if empty)
      const toList = (val: any): string[] | null => {
        if (!val || (typeof val === 'string' && !val.trim())) return null
        if (Array.isArray(val)) return val.filter(Boolean)
        return val.split(',').map((s: string) => s.trim()).filter(Boolean)
      }
      // Helper: return null instead of empty string for optional text fields
      const strOrNull = (val: any) => (typeof val === 'string' && val.trim() === '') ? null : val?.trim() ?? null

      // Ensure proper data types for backend
      const formattedProductData = {
        ...productData,
        price: parseFloat((formData.price ?? 0).toString()),
        mrp: formData.mrp != null ? parseFloat(formData.mrp.toString()) : null,
        stock_quantity: parseInt((formData.stock_quantity ?? 0).toString()),
        warehouse_stock: parseInt((formData.warehouse_stock ?? 0).toString()),
        b2c_retail_price: formData.b2c_retail_price != null ? parseFloat(formData.b2c_retail_price.toString()) : null,
        b2b_wholesale_price: formData.b2b_wholesale_price != null ? parseFloat(formData.b2b_wholesale_price.toString()) : null,
        b2b_moq: parseInt((formData.b2b_moq ?? 1).toString()),
        tax_rate: formData.tax_rate != null ? parseFloat(formData.tax_rate.toString()) : 0,
        suggested_retail_price: formData.suggested_retail_price != null ? parseFloat(formData.suggested_retail_price.toString()) : null,
        minimum_selling_price: formData.minimum_selling_price != null ? parseFloat(formData.minimum_selling_price.toString()) : null,
        // List fields — schema expects arrays, form stores as comma-separated strings
        key_benefits: toList(formData.key_benefits),
        key_ingredients: toList(formData.key_ingredients),
        skin_types: toList(formData.skin_types),
        skin_concerns: toList(formData.skin_concerns),
        // Optional text fields — send null not empty string
        brand: strOrNull(formData.brand),
        manufacturer: strOrNull(formData.manufacturer),
        origin: strOrNull(formData.origin),
        size: strOrNull(formData.size),
        formula: strOrNull(formData.formula),
        how_to_use: strOrNull(formData.how_to_use),
        texture: strOrNull(formData.texture),
        storage_requirements: strOrNull(formData.storage_requirements),
        // Clean up SEO fields
        meta_title: formData.meta_title?.trim() || null,
        meta_description: formData.meta_description?.trim() || null,
        // Set default status if not provided
        status: formData.status || 'draft',
        customer_type: formData.customer_type || 'BOTH',
        is_warehouse_product: formData.is_warehouse_product === true,
        added_by_admin: formData.added_by_admin === true
      }

      const isEditing = !!existingProduct
      const toastId = isEditing ? 'update-product' : 'create-product'
      toast.loading(isEditing ? 'Saving changes...' : 'Creating product...', { id: toastId })

      let response: any
      if (isEditing) {
        response = await apiClient.updateProduct(existingProduct.id, formattedProductData)
        toast.success('Product updated successfully!', { id: toastId })
      } else {
        response = await apiClient.createProduct(formattedProductData)
        toast.success('Product created successfully!', { id: toastId })
        localStorage.removeItem('product-create-draft')
      }

      if (onSave) {
        onSave(response?.product ?? formattedProductData)
      }

      if (!isModal) {
        if (formData.status === 'draft') {
          router.push('/admin/products?filter=drafts')
        } else {
          router.push('/admin/products')
        }
      }
    } catch (error: any) {
      console.error('Failed to save product:', error)

      let errorMessage = existingProduct ? 'Failed to update product' : 'Failed to create product'

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage, { id: existingProduct ? 'update-product' : 'create-product' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!isModal && (
        <>
          {/* Header with Progress and Auto-save */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={20} />
                Back to Products
              </button>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">
                  {existingProduct ? 'Edit Product' : 'Create New Product'}
                </h1>
                
                {/* Form Progress Indicator */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-500">
                    Form Completion
                  </div>
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${formProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{formProgress}%</span>
                </div>
                
                {/* Auto-save Indicator */}
                {draftSaved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={16} />
                    <span className="text-sm font-medium">Draft Saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-slate-500">
              {existingProduct ? 'Edit product details for the platform catalog' : 'Create a new product listing for the platform catalog'}
            </p>
          </div>
        </>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information with Real-time Validation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name *
                {validation.name?.hint && (
                  <div className="text-xs text-slate-500 mb-1">
                    💡 {validation.name.hint}
                  </div>
                )}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name ?? ''}
                onChange={handleInputChange}
                required
                placeholder="e.g. COSRX Snail Mucin 96% Power Repairing Essence"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  validation.name?.isValid === false ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {validation.name?.isValid === false && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertCircle size={16} />
                  <span>{validation.name.message}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price *
                {validation.price?.hint && (
                  <div className="text-xs text-slate-500 mb-1">
                    💡 {validation.price.hint}
                  </div>
                )}
              </label>
              <input
                type="number"
                name="price"
                value={formData.price ?? ''}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="e.g. 29.99"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  validation.price?.isValid === false ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {validation.price?.isValid === false && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertCircle size={16} />
                  <span>{validation.price.message}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                MRP (Maximum Retail Price)
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp ?? ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="e.g. 39.99"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <CategorySelector
              value={formData.category ?? ''}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              categories={categories}
              required={true}
              error={validation.category?.isValid === false ? validation.category.message : undefined}
              hint={validation.category?.hint}
              disabled={isSubmitting}
              onCategoryCreated={fetchCategories}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand ?? ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer ?? ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Origin
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin ?? ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity ?? ''}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g. 100"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description ?? ''}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Product Details — collapsible */}
        <div className="bg-white rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setShowDetails(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors rounded-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">Product Details <span className="text-sm font-normal text-slate-400">(optional)</span></h2>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showDetails && <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size ?? ''}
                onChange={handleInputChange}
                placeholder="e.g., 50ml, 100g"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Texture
              </label>
              <input
                type="text"
                name="texture"
                value={formData.texture ?? ''}
                onChange={handleInputChange}
                placeholder="e.g., Cream, Gel, Serum"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Formula
              </label>
              <input
                type="text"
                name="formula"
                value={formData.formula ?? ''}
                onChange={handleInputChange}
                placeholder="e.g., Oil-free, Hydrating"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skin Types
              </label>
              <input
                type="text"
                name="skin_types"
                value={formData.skin_types ?? ''}
                onChange={handleInputChange}
                placeholder="e.g., All, Oily, Dry, Combination"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                How to Use
              </label>
              <textarea
                name="how_to_use"
                value={formData.how_to_use ?? ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="e.g. Apply a small amount to cleansed face and neck. Gently pat until absorbed."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Key Benefits
              </label>
              <textarea
                name="key_benefits"
                value={formData.key_benefits ?? ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="e.g. Deeply hydrates, brightens skin tone, reduces fine lines"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Key Ingredients
              </label>
              <textarea
                name="key_ingredients"
                value={formData.key_ingredients ?? ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="e.g. Snail Secretion Filtrate 96%, Niacinamide, Panthenol"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skin Concerns
              </label>
              <textarea
                name="skin_concerns"
                value={formData.skin_concerns ?? ''}
                onChange={handleInputChange}
                rows={2}
                placeholder="e.g. Dryness, Dullness, Uneven texture, Acne scars"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          </div>}
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Images</h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || images.length >= 5}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${uploading || images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  {uploading ? 'Uploading images...' : images.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload images'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each (max 5 images)</p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Fields */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Type
              </label>
              <select
                name="customer_type"
                value={formData.customer_type ?? 'BOTH'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B">B2B (Business to Business)</option>
                <option value="BOTH">Both B2C and B2B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status ?? 'draft'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                Featured Product
              </label>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="is_warehouse_product"
                id="is_warehouse_product"
                checked={formData.is_warehouse_product}
                onChange={handleInputChange}
                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <label htmlFor="is_warehouse_product" className="text-sm font-medium text-slate-700">
                Warehouse Product
              </label>
            </div>
          </div>
        </div>

        {/* Warehouse Pricing */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Warehouse Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Warehouse Stock
              </label>
              <input
                type="number"
                name="warehouse_stock"
                value={formData.warehouse_stock ?? ''}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Suggested Retail Price
              </label>
              <input
                type="number"
                name="suggested_retail_price"
                value={formData.suggested_retail_price ?? ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Selling Price
              </label>
              <input
                type="number"
                name="minimum_selling_price"
                value={formData.minimum_selling_price ?? ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                B2C Retail Price
              </label>
              <input
                type="number"
                name="b2c_retail_price"
                value={formData.b2c_retail_price ?? ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="Price for B2C stores"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                B2B Wholesale Price
              </label>
              <input
                type="number"
                name="b2b_wholesale_price"
                value={formData.b2b_wholesale_price ?? ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="Price for B2B wholesalers"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                B2B Minimum Order Quantity
              </label>
              <input
                type="number"
                name="b2b_moq"
                value={formData.b2b_moq ?? ''}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g. 10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings — collapsible */}
        <div className="bg-white rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setShowSEO(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors rounded-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">SEO Settings <span className="text-sm font-normal text-slate-400">(optional)</span></h2>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showSEO ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showSEO && <div className="px-6 pb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title ?? ''}
                onChange={handleInputChange}
                placeholder="Custom meta title (optional)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description ?? ''}
                onChange={handleInputChange}
                rows={2}
                placeholder="Custom meta description (optional)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          </div>}
        </div>

        {/* Action Buttons — sticky in modal mode */}
        <div className={`flex items-center justify-between gap-4${isModal ? ' sticky bottom-0 bg-white border-t border-slate-100 py-4 -mx-6 px-6 mt-2' : ''}`}>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
            {unsavedChanges && !existingProduct && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    price: undefined as unknown as number,
                    category: '',
                    brand: '',
                    manufacturer: '',
                    origin: 'South Korea',
                    stock_quantity: undefined,
                    size: '',
                    formula: '',
                    how_to_use: '',
                    key_benefits: '',
                    key_ingredients: '',
                    skin_types: '',
                    skin_concerns: '',
                    texture: '',
                    suggested_retail_price: undefined,
                    minimum_selling_price: undefined,
                    logistics_mode: 'WAREHOUSE_TO_STORE',
                    tax_rate: undefined,
                    requires_license: false,
                    storage_requirements: '',
                    images: [],
                    categories: [],
                    subcategories: [],
                    warehouse_stock: undefined,
                    b2c_retail_price: undefined,
                    b2b_wholesale_price: undefined,
                    b2b_moq: undefined,
                    customer_type: 'BOTH',
                    is_warehouse_product: true,
                    added_by_admin: true,
                    status: 'draft',
                    featured: false,
                    meta_title: '',
                    meta_description: ''
                  })
                  setImages([])
                  setUnsavedChanges(false)
                  localStorage.removeItem('product-create-draft')
                  toast.success('Form cleared')
                }}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                <Trash2 size={16} />
                <span>Clear Form</span>
              </button>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 disabled:from-slate-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{existingProduct ? 'Saving...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>{existingProduct ? 'Save Changes' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
