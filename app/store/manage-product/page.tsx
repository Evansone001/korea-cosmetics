'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  sold: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
}

export default function ManageProductPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const categories = ['Skincare', 'Makeup', 'Haircare', 'Bodycare', 'Fragrance'];
  const statuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'inactive', label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
    { value: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
  ];

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    try {
      const response = await fetch('/api/store/products');
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        toast.error(data.error || 'Failed to fetch products');
        // Fallback to empty array for demo
        setProducts([]);
      }
    } catch (error) {
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/store/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        setProducts(prev =>
          prev.map(p =>
            p.id === productId ? { ...p, status: newStatus } : p
          )
        );
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product from your store?')) return;
    
    try {
      const response = await fetch(`/api/store/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product removed from store');
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        toast.error('Failed to remove product');
      }
    } catch (error) {
      toast.error('Failed to remove product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStatus = !selectedStatus || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalSold = products.reduce((acc, p) => acc + p.sold, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
          <p className="text-slate-500 mt-1">
            View and manage your store's products
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/store/catalog"
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Package size={18} />
            Add Products
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Package className="text-pink-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              <p className="text-sm text-slate-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeProducts}</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{outOfStockProducts}</p>
              <p className="text-sm text-slate-500">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalSold}</p>
              <p className="text-sm text-slate-500">Total Sold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your products..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="">All Status</option>
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Sold</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden relative flex-shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="text-slate-300" size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm bg-slate-100 px-2 py-1 rounded">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-medium text-slate-900">${product.price}</span>
                      {product.mrp && (
                        <span className="text-sm text-slate-400 line-through ml-2">${product.mrp}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      product.stock === 0 ? 'text-red-600' : 
                      product.stock < 10 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{product.sold}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      statuses.find(s => s.value === product.status)?.color || 'bg-slate-100 text-slate-700'
                    }`}>
                      {statuses.find(s => s.value === product.status)?.label || product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.status === 'active' ? 'inactive' : 'active')}
                        className="p-2 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Edit2 size={18} />
                      </button>
                      <Link
                        href={`/product/${product.id}`}
                        target="_blank"
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Product"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from Store"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery || selectedCategory || selectedStatus
                ? 'No products match your filters'
                : 'No products in your store yet'
              }
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery || selectedCategory || selectedStatus
                ? 'Try adjusting your search or filters'
                : 'Go to the catalog to add products to your store'
              }
            </p>
            {!searchQuery && !selectedCategory && !selectedStatus && (
              <Link
                href="/store/catalog"
                className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Package size={18} />
                Browse Catalog
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
