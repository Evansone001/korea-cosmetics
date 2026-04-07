'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  RefreshCw, 
  Package, 
  Store, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Filter,
  Send,
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  Save
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  manufacturer: string;
  brand: string;
  images: string[];
  stock: number;
  origin: string;
  source: 'crm' | 'manual';
  createdAt: string;
}

interface Store {
  id: string;
  name: string;
  username: string;
  status: string;
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [distributing, setDistributing] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: '',
    manufacturer: '',
    brand: '',
    stock: '',
    origin: 'South Korea',
    images: [] as string[],
  });
  const [sourceFilter, setSourceFilter] = useState<'all' | 'crm' | 'manual'>('all');

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [sourceFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/admin/products?source=${sourceFilter}`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const manufacturers = ['COSRX', 'Innisfree', 'Some By Mi', 'Beauty of Joseon', 'Laneige', 'Etude House'];
  const categories = ['Skincare', 'Makeup', 'Haircare', 'Bodycare', 'Fragrance'];

  const fetchCRMProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (manufacturer) params.append('manufacturer', manufacturer);
      if (category) params.append('category', category);

      const response = await fetch(`/api/admin/crm-products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = data.products.filter((p: Product) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
        toast.success(`Found ${data.count} products from CRM`);
      } else {
        toast.error(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      toast.error('Failed to connect to CRM');
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/crm-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts.length > 0 ? selectedProducts : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedProducts([]);
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const distributeToStore = async () => {
    if (!selectedStore || selectedProducts.length === 0) {
      toast.error('Please select a store and products');
      return;
    }

    setDistributing(true);
    try {
      const response = await fetch('/api/admin/distribute-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          storeId: selectedStore,
          pricing: { markup: 20 }, // 20% markup for stores
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Distributed to store successfully!`);
        setSelectedProducts([]);
        setSelectedStore('');
      } else {
        toast.error(data.error || 'Distribution failed');
      }
    } catch (error) {
      toast.error('Distribution failed');
    } finally {
      setDistributing(false);
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newProduct: Product = {
      id: `manual_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
      category: formData.category,
      manufacturer: formData.manufacturer,
      brand: formData.brand,
      images: formData.images,
      stock: parseInt(formData.stock) || 0,
      origin: formData.origin,
      source: 'manual',
      createdAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);
    toast.success('Product added successfully!');
    setShowAddForm(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      mrp: '',
      category: '',
      manufacturer: '',
      brand: '',
      stock: '',
      origin: 'South Korea',
      images: [],
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Product deleted');
  };

  const filteredProducts = products.filter(p => {
    if (sourceFilter === 'all') return true;
    return p.source === sourceFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-slate-500 mt-1">
            Manage products from CRM or add manually for stores
          </p>
        </div>
      <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-all"
          >
            <Plus size={18} />
            Add Product
          </button>
          <button
            onClick={fetchCRMProducts}
            disabled={loading}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:border-slate-300 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Fetch from CRM
          </button>
        </div>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'crm', 'manual'] as const).map((source) => (
          <button
            key={source}
            onClick={() => setSourceFilter(source)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              sourceFilter === source
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {source === 'all' ? 'All Products' : `${source} Products`}
            <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {source === 'all' ? products.length : products.filter(p => p.source === source).length}
            </span>
          </button>
        ))}
      </div>

      {/* Add Product Form Modal */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Add New Product</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddProduct} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., COSRX Advanced Snail 96 Essence"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                rows={3}
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="29.99"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                MRP / Original Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="39.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Manufacturer/Brand
              </label>
              <select
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value, brand: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select manufacturer</option>
                {manufacturers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Origin
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="South Korea"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Images
              </label>
              
              {/* Image Previews */}
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Image Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="imageInput"
                  placeholder="Enter image URL"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('imageInput') as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value) {
                      setFormData(prev => ({ ...prev, images: [...prev.images, value] }));
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                >
                  Add Image
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Enter a direct image URL (e.g., https://example.com/image.jpg)</p>
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
              >
                <Save size={18} />
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-slate-400" />
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchCRMProducts}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-600" size={20} />
            <span className="text-blue-900 font-medium">
              {selectedProducts.length} products selected
            </span>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Select Store...</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={distributeToStore}
              disabled={distributing || !selectedStore}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {distributing ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Distribute
            </button>
            <button
              onClick={syncProducts}
              disabled={syncing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {syncing ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Package size={18} />
              )}
              Import to Catalog
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
              onChange={selectAll}
              className="w-4 h-4 text-slate-900 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">Select All</span>
          </div>
          <span className="text-sm text-slate-500">
            {filteredProducts.length} products found
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No products yet</h3>
            <p className="text-slate-500 mb-4">
              Add products manually or import from CRM
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Product
              </button>
              <button
                onClick={fetchCRMProducts}
                className="bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl hover:border-slate-300 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Fetch from CRM
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`border rounded-xl overflow-hidden transition-all ${
                  selectedProducts.includes(product.id)
                    ? 'border-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-square bg-slate-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-slate-300" size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="w-5 h-5 text-slate-900 rounded border-slate-300"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.source === 'crm' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {product.source === 'crm' ? 'CRM' : 'Manual'}
                    </span>
                    <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                      {product.origin}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {product.manufacturer}
                  </p>
                  <h3 className="font-medium text-slate-900 mt-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-bold text-slate-900">${product.price}</span>
                      {product.mrp && (
                        <span className="text-sm text-slate-400 line-through ml-2">
                          ${product.mrp}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-700'
                        : product.stock > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">{product.category}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">{product.brand}</span>
                  </div>
                  {product.source === 'manual' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
