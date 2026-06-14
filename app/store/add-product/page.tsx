'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Plus, 
  Minus, 
  Package, 
  DollarSign, 
  Tag, 
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  mrp: string;
  category: string;
  brand: string;
  manufacturer: string;
  origin: string;
  stock: string;
  images: File[];
  size?: string;
  formula?: string;
  how_to_use?: string;
  key_benefits?: string;
  key_ingredients?: string;
  skin_types?: string;
  skin_concerns?: string;
  texture?: string;
}

interface FormValidation {
  [fieldName: string]: {
    isValid: boolean;
    message: string;
    hint?: string;
  };
}

interface DraftData {
  formData: ProductFormData;
  timestamp: number;
  version: number;
}

const categories = [
  'Skincare',
  'Makeup', 
  'Haircare',
  'Bodycare',
  'Fragrance',
  'Tools & Accessories',
  'Sets & Bundles'
];

const brands = ['COSRX', 'Innisfree', 'Some By Mi', 'Beauty of Joseon', 'Laneige', 'Other'];
const origins = [ 'South Korea'];

export default function AddProductPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: '',
    brand: '',
    manufacturer: '',
    origin: 'S. Korea',
    stock: '10',
    images: [],
  });

  const [storeId, setStoreId] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Enhanced UX states
  const [validation, setValidation] = useState<FormValidation>({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch store ID on mount
    apiClient.getMyStore().then((response: any) => {
      if (response?.store?.id) {
        setStoreId(response.store.id);
      }
    }).catch(() => {
      // Silently fail - error will show on submit
    });
    
    // Restore draft on mount
    try {
      const draft = localStorage.getItem('store-product-draft');
      if (draft) {
        const draftData: DraftData = JSON.parse(draft);
        
        // Only restore if draft is recent (within 24 hours)
        if (Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(draftData.formData);
          setImagePreviews([]); // Clear previews as File objects can't be stored
          toast.success('Draft restored!');
          setUnsavedChanges(false);
        }
      }
    } catch (error) {
      console.error('Failed to restore draft:', error);
    }
  }, []);

  // Real-time validation with immediate feedback
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
          isValid: value && !isNaN(value) && parseFloat(value) > 0,
          message: value && !isNaN(value) && parseFloat(value) > 0 ? '' : 'Price must be a valid positive number',
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
    const fieldValue = type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))
    
    // Real-time validation
    const fieldValidation = validateField(name, fieldValue)
    setValidation(prev => ({
      ...prev,
      [name]: fieldValidation
    }))
    
    // Mark as unsaved changes
    setUnsavedChanges(true)
  }, [validateField])
  
  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const requiredFields = ['name', 'description', 'price', 'category']
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof ProductFormData]
      if (typeof value === 'string') {
        return value.trim().length > 0
      } else if (typeof value === 'number') {
        return value > 0
      } else if (Array.isArray(value)) {
        return value.length > 0
      }
      return false
    }).length
    
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData])
  
  // Update progress when form data changes
  useEffect(() => {
    const progress = calculateProgress()
    setFormProgress(progress)
  }, [formData, calculateProgress])

  // Auto-save functionality
  const saveDraft = useCallback(() => {
    const draftData: DraftData = {
      formData: { ...formData },
      timestamp: Date.now(),
      version: 1
    }
    
    try {
      localStorage.setItem('store-product-draft', JSON.stringify(draftData))
      setDraftSaved(true)
      toast.success('Draft saved!')
      setUnsavedChanges(false)
      
      // Clear draft saved notification after 3 seconds
      setTimeout(() => setDraftSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast.error('Failed to save draft')
    }
  }, [formData])
  
  // Auto-save on form changes
  useEffect(() => {
    if (unsavedChanges) {
      const timer = setTimeout(() => {
        saveDraft()
      }, 5000) // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timer)
    }
  }, [unsavedChanges, saveDraft])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    
    if (formData.images.length + newImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    
    // Mark as unsaved changes
    setUnsavedChanges(true);

    // Create previews
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Mark as unsaved changes
    setUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    const requiredFields = ['name', 'description', 'price', 'category']
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof ProductFormData]
      return !value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && value <= 0)
    })
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`)
      // Highlight missing fields
      missingFields.forEach(field => {
        setValidation(prev => ({
          ...prev,
          [field]: { isValid: false, message: 'This field is required' }
        }))
      })
      return
    }

    setIsSubmitting(true)

    if (!storeId) {
      toast.error('No store found. Please create a store first.');
      setLoading(false);
      return;
    }

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        toast.loading('Uploading images...', { id: 'upload' });
        try {
          const uploadPromises = formData.images.map(file => apiClient.uploadProductImage(file));
          const uploadResults = await Promise.all(uploadPromises);
          imageUrls = uploadResults.map(result => result.url);
          toast.success('Images uploaded!', { id: 'upload' });
        } catch (uploadError) {
          toast.error('Failed to upload images', { id: 'upload' });
          setLoading(false);
          return;
        }
      }

      // Call backend API to create product with image URLs
      await apiClient.createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        category: formData.category,
        brand: formData.brand || undefined,
        manufacturer: formData.manufacturer || undefined,
        origin: formData.origin || 'Korea',
        stock_quantity: parseInt(formData.stock) || 0,
        store_id: storeId,
        images: imageUrls
      });

      toast.success('Product added successfully!');
      
      // Clear draft after successful creation
      localStorage.removeItem('store-product-draft');
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      mrp: '',
      category: '',
      brand: '',
      manufacturer: '',
      origin: 'Korea',
      stock: '10',
      images: [],
    });
    setImagePreviews([]);
    setValidation({});
    setFormProgress(0);
    setUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Progress and Auto-save */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
          
          {/* Form Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-500">
              Form Completion
            </div>
            <div className="flex-1 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
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
      
      <div className="mb-8">
        <p className="text-slate-500">Create a new product listing for your store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="text-slate-400" size={20} />
            <h3 className="font-semibold text-slate-900">Product Images</h3>
            <span className="text-sm text-slate-400">({formData.images.length}/5)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Upload Button */}
            <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all">
              <Upload className="text-slate-400 mb-2" size={24} />
              <span className="text-xs text-slate-500">Add Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Image Previews */}
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-slate-400" size={20} />
            <h3 className="font-semibold text-slate-900">Basic Information</h3>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Product Name <span className="text-red-500">*</span>
              {validation.name?.hint && (
                <div className="text-xs text-slate-500 mt-1">
                  💡 {validation.name.hint}
                </div>
              )}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., COSRX Advanced Snail 92 Cream"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                validation.name?.isValid === false ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
              required
            />
            {validation.name?.isValid === false && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                <span>{validation.name.message}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-slate-400 ml-2">(minimum 20 characters)</span>
              {validation.description?.hint && (
                <div className="text-xs text-slate-500 mt-1">
                  💡 {validation.description.hint}
                </div>
              )}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product, its benefits, and key ingredients..."
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none ${
                validation.description?.isValid === false ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
              required
            />
            {validation.description?.isValid === false && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                <span>{validation.description.message}</span>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
              {validation.category?.hint && (
                <div className="text-xs text-slate-500 mt-1">
                  💡 {validation.category.hint}
                </div>
              )}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white ${
                validation.category?.isValid === false ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              }`}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {validation.category?.isValid === false && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                <span>{validation.category.message}</span>
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Brand
            </label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              <option value="">Select a brand (optional)</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Manufacturer */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              placeholder="e.g., COSRX, Amorepacific"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* Origin */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Origin
            </label>
            <select
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              {origins.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Stock Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, stock: String(Math.max(0, parseInt(prev.stock) - 1)) }))}
                className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="w-24 text-center px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, stock: String(parseInt(prev.stock) + 1) }))}
                className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-slate-400" size={20} />
            <h3 className="font-semibold text-slate-900">Pricing</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Selling Price (KES) <span className="text-red-500">*</span>
                {validation.price?.hint && (
                  <div className="text-xs text-slate-500 mt-1">
                    💡 {validation.price.hint}
                  </div>
                )}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="29.99"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                    validation.price?.isValid === false ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                  required
                />
              </div>
              {validation.price?.isValid === false && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertCircle size={16} />
                  <span>{validation.price.message}</span>
                </div>
              )}
            </div>

            {/* MRP */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                MRP / Original Price (KES)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
                  placeholder="39.99"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size || ''}
                onChange={handleInputChange}
                placeholder="e.g., 50ml, 100g"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Texture
              </label>
              <input
                type="text"
                name="texture"
                value={formData.texture || ''}
                onChange={handleInputChange}
                placeholder="e.g., Cream, Gel, Serum"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Formula
              </label>
              <input
                type="text"
                name="formula"
                value={formData.formula || ''}
                onChange={handleInputChange}
                placeholder="e.g., Oil-free, Hydrating"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Skin Types
              </label>
              <input
                type="text"
                name="skin_types"
                value={formData.skin_types || ''}
                onChange={handleInputChange}
                placeholder="e.g., All, Oily, Dry, Combination"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                How to Use
              </label>
              <textarea
                name="how_to_use"
                value={formData.how_to_use || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Key Benefits
              </label>
              <textarea
                name="key_benefits"
                value={formData.key_benefits || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Key Ingredients
              </label>
              <textarea
                name="key_ingredients"
                value={formData.key_ingredients || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Skin Concerns
              </label>
              <textarea
                name="skin_concerns"
                value={formData.skin_concerns || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Submit Section */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-4">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={saveDraft}
              disabled={isSubmitting || draftSaved}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              <span>Save Draft</span>
            </button>
            
            {/* Clear Form Button */}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  mrp: '',
                  category: '',
                  brand: '',
                  manufacturer: '',
                  origin: 'Korea',
                  stock: '10',
                  images: [],
                });
                setValidation({});
                setFormProgress(0);
                setUnsavedChanges(false);
                setImagePreviews([]);
                toast.success('Form cleared');
              }}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              <Trash2 size={16} />
              <span>Clear Form</span>
            </button>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Adding Product...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Add Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
