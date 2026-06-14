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
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface StoreProduct {
  id: string;           // StoreProduct.id (join-table PK)
  product_id: string;   // catalog Product.id (for links)
  name: string;
  product_name: string;
  description: string;
  store_product_name?: string;
  store_description?: string;
  price: number;
  cost_price?: number;
  category: string;
  brand?: string;
  images: string[];
  product_image?: string;
  stock_quantity: number;
  purchased_quantity?: number;
  sold_quantity?: number;
  reorder_level?: number;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'archived';
  in_stock?: boolean;
  purchased_from_warehouse?: boolean;
  purchase_order_id?: string;
  createdAt: string;
  updated_at?: string;
}

export default function ManageProductPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    price: 0,
    reorder_level: 5,
    store_product_name: '',
    store_description: '',
    visibility_notes: '',
    shipping_preference: 'ship_from_store' as 'ship_from_store' | 'ship_from_warehouse'
  });

  const categories = ['Skincare', 'Makeup', 'Haircare', 'Bodycare', 'Fragrance'];

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    try {
      const response = await apiClient.getInventory({ limit: 100 });
      const mappedProducts: StoreProduct[] = (response.inventory || []).map((p: any) => ({
        id: p.id,
        product_id: p.product_id,
        name: p.store_product_name || p.product_name || 'Unknown',
        product_name: p.product_name || 'Unknown',
        description: p.store_description || '',
        store_product_name: p.store_product_name,
        store_description: p.store_description,
        price: p.price,
        cost_price: p.cost_price,
        category: p.category || 'Uncategorized',
        brand: p.category || '',
        images: p.product_image ? [p.product_image] : [],
        product_image: p.product_image,
        stock_quantity: p.stock_quantity || 0,
        purchased_quantity: p.purchased_quantity || 0,
        sold_quantity: p.sold_quantity || 0,
        reorder_level: p.reorder_level || 5,
        status: (p.status as any) || 'active',
        in_stock: p.stock_quantity > 0,
        purchased_from_warehouse: p.purchased_from_warehouse || false,
        purchase_order_id: p.purchase_order_id || null,
        createdAt: p.updated_at || new Date().toISOString(),
        updated_at: p.updated_at,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (storeProductId: string) => {
    if (!confirm('Are you sure you want to remove this product from your store?')) return;

    try {
      await apiClient.removeStoreProduct(storeProductId);
      toast.success('Product removed from store');
      setProducts(prev => prev.filter(p => p.id !== storeProductId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to remove product');
    }
  };

  const adjustStock = async (productId: string, adjustment: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock_quantity + adjustment);

    try {
      await apiClient.updateStock(productId, newStock);
      toast.success(`Stock adjusted to ${newStock}`);
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, stock_quantity: newStock } : p
        )
      );
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  const openEditModal = (product: StoreProduct) => {
    setEditingProduct(product);
    setEditForm({
      price: product.price,
      reorder_level: product.reorder_level || 5,
      store_product_name: product.store_product_name || '',
      store_description: product.store_description || '',
      visibility_notes: (product as any).visibility_notes || '',
      shipping_preference: (product as any).shipping_preference || 'ship_from_store'
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      await apiClient.updateStoreProductInventory(editingProduct.id, {
        price: editForm.price,
        reorder_level: editForm.reorder_level,
        store_product_name: editForm.store_product_name || undefined,
        store_description: editForm.store_description || undefined,
        visibility_notes: editForm.visibility_notes || undefined,
        shipping_preference: editForm.shipping_preference
      });
      toast.success('Product updated successfully');
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id ? {
            ...p,
            price: editForm.price,
            reorder_level: editForm.reorder_level,
            store_product_name: editForm.store_product_name || undefined,
            store_description: editForm.store_description || undefined,
            name: editForm.store_product_name || p.name,
            description: editForm.store_description || p.description,
            visibility_notes: editForm.visibility_notes,
            shipping_preference: editForm.shipping_preference
          } : p
        )
      );
      closeEditModal();
      fetchStoreProducts();
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;
  const totalSold = products.reduce((acc, p) => acc + (p.sold_quantity || 0), 0);

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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                          {product.purchased_from_warehouse && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 flex-shrink-0" title={`From warehouse purchase ${product.purchase_order_id || ''}`}>WH</span>
                          )}
                        </div>
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
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(product.id, -1)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          disabled={product.stock_quantity === 0}
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`text-sm font-medium w-12 text-center ${
                          product.stock_quantity === 0 ? 'text-red-600' :
                          product.stock_quantity < (product.reorder_level || 5) ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {product.stock_quantity}
                        </span>
                        <button
                          onClick={() => adjustStock(product.id, 1)}
                          className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={
                            product.purchased_from_warehouse
                              ? product.stock_quantity >= (product.purchased_quantity || 0) - (product.sold_quantity || 0)
                              : false
                          }
                          title={product.purchased_from_warehouse ? `Max: ${(product.purchased_quantity || 0) - (product.sold_quantity || 0)} units` : undefined}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {product.purchased_from_warehouse && (
                        <p className="text-[10px] text-slate-400 leading-none">
                          Max: {(product.purchased_quantity || 0) - (product.sold_quantity || 0)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{product.sold_quantity || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={18} />
                      </button>
                      <Link
                        href={`/product/${product.product_id}`}
                        target="_blank"
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Product"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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
              {searchQuery || selectedCategory
                ? 'No products match your filters'
                : 'No products in your store yet'
              }
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Go to the catalog to add products to your store'
              }
            </p>
            {!searchQuery && !selectedCategory && (
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

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Original Product Name</label>
                <p className="text-slate-900">{editingProduct.product_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Product Name (Optional)</label>
                <input
                  type="text"
                  value={editForm.store_product_name}
                  onChange={(e) => setEditForm({ ...editForm, store_product_name: e.target.value })}
                  placeholder="Override product name for your store"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to use original name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Description (Optional)</label>
                <textarea
                  value={editForm.store_description}
                  onChange={(e) => setEditForm({ ...editForm, store_description: e.target.value })}
                  placeholder="Add custom description for this product in your store"
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to use catalog description</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (KES)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min={0}
                  step={0.01}
                />
                {editingProduct.cost_price && (
                  <p className="text-xs text-slate-500 mt-1">Cost: ${editingProduct.cost_price} - Price must be above cost</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert Level</label>
                <input
                  type="number"
                  value={editForm.reorder_level}
                  onChange={(e) => setEditForm({ ...editForm, reorder_level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min={1}
                />
                <p className="text-xs text-slate-500 mt-1">Alert when stock falls below this level</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility Notes (Optional)</label>
                <textarea
                  value={editForm.visibility_notes}
                  onChange={(e) => setEditForm({ ...editForm, visibility_notes: e.target.value })}
                  placeholder="Notes on why this product is shown/hidden"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Preference</label>
                <select
                  value={editForm.shipping_preference}
                  onChange={(e) => setEditForm({ ...editForm, shipping_preference: e.target.value as 'ship_from_store' | 'ship_from_warehouse' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="ship_from_store">Ship from Store</option>
                  <option value="ship_from_warehouse">Ship from Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                <p className="text-slate-900">{editingProduct.stock_quantity} units</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
