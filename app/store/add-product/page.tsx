'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
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

  useEffect(() => {
    // Fetch store ID on mount
    apiClient.getMyStore().then((response: any) => {
      if (response?.store?.id) {
        setStoreId(response.store.id);
      }
    }).catch(() => {
      // Silently fail - error will show on submit
    });
  }, []);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

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
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        <p className="text-slate-500 mt-1">Create a new product listing for your store</p>
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
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., COSRX Advanced Snail 92 Cream"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-slate-400 ml-2">(minimum 10 characters)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product, its benefits, and key ingredients..."
              rows={4}
              minLength={10}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
                Selling Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="29.99"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* MRP */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                MRP / Original Price ($)
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


        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Add Product
              </>
            )}
          </button>
          
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
              setImagePreviews([]);
            }}
            className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-slate-300 transition-all"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
