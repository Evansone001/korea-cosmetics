'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Minus,
  CheckCircle2,
  ShoppingBag,
  Building2,
  ShoppingCart,
  Store
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  customer_type?: 'B2C' | 'B2B' | 'BOTH';
  warehouse_stock?: number;
  store_price?: number;
  store_moq?: number;
  b2b_moq?: number;
  images?: string[];
  manufacturer?: string;
  origin?: string;
  alreadyAdded?: boolean;
}

// Helper to get full image URL
const getImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Use backend URL for relative paths
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  return `${backendUrl}${path}`;
};

export default function StoreCatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [storeType, setStoreType] = useState<string>('');
  const [addingProduct, setAddingProduct] = useState<string | null>(null);
  
  // Purchase dialog state
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    try {
      // Fetch warehouse catalog products (filtered by store type)
      const response = await apiClient.getStoreCatalog({
        category: selectedCategory || undefined,
        search: searchQuery || undefined
      });
      setProducts(response.products || []);
      setStoreType(response.store_customer_type || 'B2C');
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const openPurchaseDialog = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setQuantity(storeType === 'B2B' ? (product.store_moq || 1) : 1);
    setIsPurchaseDialogOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    
    if (storeType === 'B2B' && quantity < (selectedProduct.store_moq || 1)) {
      toast.error(`Minimum order quantity is ${selectedProduct.store_moq}`);
      return;
    }
    
    setAddingProduct(selectedProduct.id);
    setIsPurchasing(true);
    
    try {
      await apiClient.purchaseFromWarehouse(selectedProduct.id, quantity);
      toast.success(`Purchased ${quantity} units of ${selectedProduct.name}`);
      setIsPurchaseDialogOpen(false);
      fetchAvailableProducts();
    } catch (error: any) {
      console.error('Failed to purchase:', error);
      toast.error(error.message || 'Failed to purchase product');
    } finally {
      setAddingProduct(null);
      setIsPurchasing(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchAvailableProducts();
  };

  // Get unique categories from products
  const categories = ['', ...Array.from(new Set(products.map(p => p.category)))];
  const manufacturers = ['COSRX', 'Innisfree', 'Some By Mi', 'Beauty of Joseon', 'Laneige'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
        <p className="text-slate-500 mt-1">
          Browse and add products from our Korean beauty suppliers to your store
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Package className="text-pink-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              <p className="text-sm text-slate-500">Available Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{storeType}</p>
              <p className="text-sm text-slate-500">Store Type</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {products.filter(p => (p.warehouse_stock ?? 0) > 0).length}
              </p>
              <p className="text-sm text-slate-500">In Stock</p>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">All Categories</option>
              {categories.filter(c => c).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-square bg-slate-100">
              {product.images && product.images[0] ? (
                <Image
                  src={getImageUrl(product.images[0])}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-slate-300" size={48} />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                {product.origin || product.brand}
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                {product.brand}
              </p>
              <h3 className="font-medium text-slate-900 mt-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {product.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  (product.warehouse_stock ?? 0) > 10
                    ? 'bg-green-100 text-green-700'
                    : (product.warehouse_stock ?? 0) > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.warehouse_stock ?? 0} available
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-900">${product.store_price ?? 0}</span>
                  {storeType === 'B2B' && (
                    <span className="text-xs text-slate-500 ml-1">(MOQ: {product.store_moq || 1})</span>
                  )}
                </div>
                <button
                  onClick={() => openPurchaseDialog(product)}
                  disabled={addingProduct === product.id || (product.warehouse_stock ?? 0) === 0}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addingProduct === product.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                  Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery || selectedCategory
              ? 'No products match your filters'
              : 'No products available yet'
            }
          </h3>
          <p className="text-slate-500">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Check back soon - admin is adding new products!'
            }
          </p>
        </div>
      )}

      {/* Purchase Dialog */}
      {isPurchaseDialogOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Purchase Product</h3>
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-slate-500">{selectedProduct.brand}</p>
                  <p className="text-lg font-bold">${selectedProduct.store_price} / unit</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center border rounded"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border rounded py-1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {storeType === 'B2B' && (
                <p className="text-sm text-slate-500 mb-2">Minimum order quantity: {selectedProduct.store_moq || 1}</p>
              )}
              
              <p className="text-sm text-slate-500">Available: {selectedProduct.warehouse_stock ?? 0} units</p>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${((selectedProduct.store_price ?? 0) * quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsPurchaseDialogOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={isPurchasing || quantity > (selectedProduct.warehouse_stock ?? 0)}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
