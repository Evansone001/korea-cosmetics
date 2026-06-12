'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  RefreshCw,
  Package,
  Store,
  CheckCircle2,
  AlertCircle,
  Building2,
  Filter,
  Search,
  Plus,
  X,
  Edit2,
  Trash2,
  Warehouse,
  Upload
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import ProductForm from '@/components/admin/ProductForm';

interface Product {
  categories: any;
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  manufacturer: string;
  brand: string;
  images: string[];
  stock_quantity: number;
  origin: string;
  source: 'crm' | 'manual';
  createdAt: string;
  is_warehouse_product?: boolean;
}

interface Store {
  id: string;
  name: string;
  username: string;
  status: string;
}

interface PendingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  status: 'pending' | 'active' | 'inactive';
  store_id: string;
  store?: {
    id: string;
    name: string;
    username: string;
  };
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    approved_product_count?: number;
    is_trusted_seller?: boolean;
  };
  created_at: string;
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  // Add to Warehouse Modal State
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [warehouseProduct, setWarehouseProduct] = useState<Product | null>(null);
  const [addingToWarehouse, setAddingToWarehouse] = useState(false);
  const [warehouseFormData, setWarehouseFormData] = useState({
    warehouse_stock: 0,
    b2c_retail_price: '',
    b2b_wholesale_price: '',
    b2b_moq: 1,
    customer_type: 'BOTH' as 'B2C' | 'B2B' | 'BOTH',
  });
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [addingManufacturer, setAddingManufacturer] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('');
  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Load manufacturers from backend on mount
  useEffect(() => {
    fetchManufacturers();
  }, []);

  // Load categories from backend on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response: any = await apiClient.getManufacturers();
      const manufacturerNames = response.manufacturers?.map((m: any) => m.name) || [];
      setManufacturers(manufacturerNames);
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
      // Fallback to default list if fetch fails
      setManufacturers(['COSRX', 'Innisfree', 'Some By Mi', 'Beauty of Joseon', 'Laneige', 'Etude House']);
    }
  };

  const fetchCategories = async () => {
    try {
      const response: any = await apiClient.getCategoriesHierarchical();
      const mainCategories = response.categories?.map((c: any) => ({
        id: c.id,
        name: c.name,
        parent_id: c.parent_id,
        is_subcategory: c.is_subcategory,
        children: c.children || []
      })) || [];
      setCategories(mainCategories);

      // Extract all subcategories for dropdown
      const allSubcategories: any[] = [];
      mainCategories.forEach((cat: any) => {
        if (cat.children?.length > 0) {
          cat.children.forEach((subcat: any) => {
            allSubcategories.push({
              id: subcat.id,
              name: subcat.name,
              parent_id: subcat.parent_id,
              parent_name: cat.name
            });
          });
        }
      });
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to default list if fetch fails
      setCategories([{ id: '1', name: 'Skincare', is_subcategory: false, children: [] }]);
      setSubcategories([]);
    }
  };

  const handleAddManufacturer = async () => {
    if (!newManufacturerName.trim()) {
      toast.error('Please enter a manufacturer name');
      return;
    }

    try {
      setAddingManufacturer(true);
      await apiClient.createManufacturer(newManufacturerName.trim());
      toast.success('Manufacturer added successfully');
      setShowManufacturerModal(false);
      setNewManufacturerName('');
      await fetchManufacturers();
    } catch (error: any) {
      console.error('Failed to add manufacturer:', error);
      toast.error(error.message || 'Failed to add manufacturer');
    } finally {
      setAddingManufacturer(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setAddingCategory(true);
      const categoryData: any = { name: newCategoryName.trim() };
      if (newCategoryParentId) {
        categoryData.parent_id = newCategoryParentId;
      }
      await apiClient.createCategory(categoryData);
      toast.success('Category added successfully');
      setNewCategoryName('');
      setNewCategoryParentId('');
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response: any = await apiClient.getProducts({ limit: 100 });

      const normalized = (response.products || []).map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
        categories: Array.isArray(p.categories) ? p.categories : [],
      }));

      setProducts(normalized);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    }
  };

  const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`;
  };

  const isProductInWarehouse = (product: Product) => {
    return product.is_warehouse_product === true;
  };


  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  // Add to Warehouse handlers
  const openWarehouseModal = (product: Product) => {
    setWarehouseProduct(product);
    // Pre-fill with product data if available
    setWarehouseFormData({
      warehouse_stock: 100,
      b2c_retail_price: product.price ? (product.price * 1.2).toFixed(2) : '', // 20% markup default
      b2b_wholesale_price: product.price ? (product.price * 0.8).toFixed(2) : '', // 20% discount default
      b2b_moq: 10,
      customer_type: 'BOTH',
    });
    setWarehouseModalOpen(true);
  };

  const handleAddToWarehouse = async () => {
    if (!warehouseProduct) return;
    
    try {
      setAddingToWarehouse(true);
      const data = {
        product_id: warehouseProduct.id,
        name: warehouseProduct.name,
        description: warehouseProduct.description,
        category: warehouseProduct.category,
        brand: warehouseProduct.brand || warehouseProduct.manufacturer,
        customer_type: warehouseFormData.customer_type,
        warehouse_stock: warehouseFormData.warehouse_stock,
        b2c_retail_price: warehouseFormData.b2c_retail_price ? parseFloat(warehouseFormData.b2c_retail_price) : null,
        b2b_wholesale_price: warehouseFormData.b2b_wholesale_price ? parseFloat(warehouseFormData.b2b_wholesale_price) : null,
        b2b_moq: warehouseFormData.b2b_moq,
        images: warehouseProduct.images,
      };
      
      await apiClient.createWarehouseProduct(data);
      toast.success(`${warehouseProduct.name} added to warehouse`);
      setWarehouseModalOpen(false);
      setWarehouseProduct(null);
      await fetchProducts();
    } catch (error: any) {
      console.error('Failed to add to warehouse:', error);
      
      // Handle specific error types
      if (error.message?.includes('already in warehouse')) {
        toast.error('This product is already in the warehouse');
      } else if (error.message?.includes('Insufficient catalog stock')) {
        const stockMatch = error.message.match(/Available: (\d+), Requested: (\d+)/);
        if (stockMatch) {
          const available = stockMatch[1];
          const requested = stockMatch[2];
          toast.error(`Only ${available} units available in catalog. Cannot transfer ${requested} units.`);
        } else {
          toast.error('Insufficient stock available in catalog');
        }
      } else if (error.message?.includes('Unauthorized')) {
        toast.error('You are not authorized to add products to warehouse');
      } else if (error.message?.includes('Network Error')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message?.includes('Missing required field')) {
        toast.error('Please fill in all required fields');
      } else {
        toast.error(error.message || 'Failed to add product to warehouse. Please try again.');
      }
    } finally {
      setAddingToWarehouse(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (manufacturer && p.manufacturer !== manufacturer) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-slate-500 mt-1">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all"
        >
          <Plus size={18} />
          Add Product
        </button>
        <Link
          href="/admin/products/import"
          className="flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-300 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all"
        >
          <Upload size={18} />
          Import
        </Link>
      </div>

      {/* Add/Edit Product Form Modal - Using Enhanced Component */}
      {(showAddForm || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Use the enhanced ProductForm component */}
            <div className="p-6">
              <ProductForm 
                existingProduct={editingProduct}
                onSave={async (productData: any) => {
                  await fetchProducts();
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                isModal={true}
              />
            </div>
          </div>
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
              {manufacturers?.map(m => (
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
              {categories?.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              title="Add new category"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {filteredProducts.length} products found
          </span>
        </div>

        {(() => {
          const safeProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
          return safeProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No products yet</h3>
            <p className="text-slate-500 mb-4">
              Add products to get started
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {safeProducts.map((product) => (
              <div
                key={product.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="relative aspect-square bg-slate-100">
                  {(() => {
                    const safeImages = Array.isArray(product.images) ? product.images : [];
                    return safeImages.length > 0 ? (
                      <Image
                        src={getImageUrl(safeImages[0])}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-slate-300" size={48} />
                      </div>
                    );
                  })()}
                  <div className="absolute top-2 right-2">
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
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        (product as any).status === 'active' ? 'bg-green-100 text-green-700'
                        : (product as any).status === 'pending' ? 'bg-amber-100 text-amber-700'
                        : (product as any).status === 'draft' ? 'bg-slate-100 text-slate-500'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {(product as any).status || 'draft'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.stock_quantity > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stock_quantity > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock_quantity} in stock
                      </span>
                      {product.is_warehouse_product && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          WH: {(product as any).warehouse_stock ?? 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {product.category && product.categories?.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        {product.categories?.map((cat: any) => (
                          <span key={cat.id} className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {cat.parent_name ? `${cat.parent_name} &gt; ${cat.name}` : cat.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">{product.category}</span>
                    )}
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">{product.brand}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                    {!isProductInWarehouse(product) ? (
                      <button
                        onClick={() => openWarehouseModal(product)}
                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        <Warehouse size={14} />
                        Add to Warehouse
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Warehouse size={14} />
                        In Warehouse
                      </span>
                    )}
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
                </div>
              </div>
            ))}
          </div>
        );
        })()}
      </div>

      {/* Add to Warehouse Modal */}
      {warehouseModalOpen && warehouseProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Add to Warehouse</h2>
                <button
                  onClick={() => setWarehouseModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Configure warehouse inventory settings for <span className="font-medium text-slate-700">{warehouseProduct.name}</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stock to Move to Warehouse *
                  </label>
                  <input
                    type="number"
                    value={warehouseFormData.warehouse_stock}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const maxStock = warehouseProduct.stock_quantity || 0;
                      if (value <= maxStock) {
                        setWarehouseFormData(prev => ({ ...prev, warehouse_stock: value }));
                      }
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    max={warehouseProduct.stock_quantity || 0}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Available catalog stock: <span className="font-medium text-emerald-600">{warehouseProduct.stock_quantity || 0}</span> units
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Amount to transfer from catalog to warehouse</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    value={warehouseFormData.customer_type}
                    onChange={(e) => setWarehouseFormData(prev => ({ ...prev, customer_type: e.target.value as 'B2C' | 'B2B' | 'BOTH' }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BOTH">Both (B2C & B2B)</option>
                    <option value="B2C">B2C Only</option>
                    <option value="B2B">B2B Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    B2C Retail Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={warehouseFormData.b2c_retail_price}
                    onChange={(e) => setWarehouseFormData(prev => ({ ...prev, b2c_retail_price: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="29.99"
                  />
                  <p className="text-xs text-slate-400 mt-1">Price for B2C stores (resellers)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    B2B Wholesale Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={warehouseFormData.b2b_wholesale_price}
                    onChange={(e) => setWarehouseFormData(prev => ({ ...prev, b2b_wholesale_price: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="19.99"
                  />
                  <p className="text-xs text-slate-400 mt-1">Price for B2B stores (wholesalers)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  B2B Minimum Order Quantity (MOQ)
                </label>
                <input
                  type="number"
                  value={warehouseFormData.b2b_moq}
                  onChange={(e) => setWarehouseFormData(prev => ({ ...prev, b2b_moq: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="1"
                />
                <p className="text-xs text-slate-400 mt-1">Minimum units B2B customers must order</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setWarehouseModalOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToWarehouse}
                disabled={addingToWarehouse || warehouseFormData.warehouse_stock <= 0}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToWarehouse ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Warehouse size={18} />
                )}
                {addingToWarehouse ? 'Adding...' : 'Add to Warehouse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manufacturer Modal */}
      {showManufacturerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Add New Manufacturer</h2>
                <button
                  onClick={() => {
                    setShowManufacturerModal(false);
                    setNewManufacturerName('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Manufacturer Name *
              </label>
              <input
                type="text"
                value={newManufacturerName}
                onChange={(e) => setNewManufacturerName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., COSRX"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManufacturer();
                  }
                }}
              />
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowManufacturerModal(false);
                  setNewManufacturerName('');
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManufacturer}
                disabled={addingManufacturer || !newManufacturerName.trim()}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingManufacturer ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                {addingManufacturer ? 'Adding...' : 'Add Manufacturer'}
              </button>
            </div>
          </div>
        </div>
  )}

{/* Add Category Modal */}
{showCategoryModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add New Category</h2>
          <button
            onClick={() => {
              setShowCategoryModal(false);
              setNewCategoryName('');
              setNewCategoryParentId('');
            }}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 mb-4"
          placeholder="e.g., Skincare"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newCategoryName.trim()) {
              handleAddCategory();
            }
          }}
        />
        
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Parent Category (Optional - leave empty for main category)
        </label>
        <select
          value={newCategoryParentId}
          onChange={(e) => setNewCategoryParentId(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">No parent (Main Category)</option>
          {categories?.filter(c => !c.parent_id).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="p-6 border-t border-slate-200 flex gap-3">
        <button
          onClick={() => {
            setShowCategoryModal(false);
            setNewCategoryName('');
            setNewCategoryParentId('');
          }}
          className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleAddCategory}
          disabled={addingCategory || !newCategoryName.trim()}
          className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {addingCategory ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
          {addingCategory ? 'Adding...' : 'Add Category'}
        </button>
      </div>
    </div>
  </div>
)}

</div>
);
}
