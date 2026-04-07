'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  ShoppingBag,
  Building2
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface AdminProduct {
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
  alreadyAdded?: boolean;
}

export default function StoreCatalogPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [addingProduct, setAddingProduct] = useState<string | null>(null);

  const categories = ['Skincare', 'Makeup', 'Haircare', 'Bodycare', 'Fragrance'];
  const manufacturers = ['COSRX', 'Innisfree', 'Some By Mi', 'Beauty of Joseon', 'Laneige'];

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    try {
      // Fetch products from admin catalog that this store doesn't have yet
      const response = await fetch('/api/store/catalog');
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        toast.error(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const addToStore = async (productId: string) => {
    setAddingProduct(productId);
    try {
      const response = await fetch('/api/store/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Product added to your store!');
        // Mark as added in the UI
        setProducts(prev =>
          prev.map(p =>
            p.id === productId ? { ...p, alreadyAdded: true } : p
          )
        );
      } else {
        toast.error(data.error || 'Failed to add product');
      }
    } catch (error) {
      toast.error('Failed to add product');
    } finally {
      setAddingProduct(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesManufacturer = !selectedManufacturer || product.manufacturer === selectedManufacturer;
    
    return matchesSearch && matchesCategory && matchesManufacturer;
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
              <Building2 className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{manufacturers.length}</p>
              <p className="text-sm text-slate-500">Suppliers</p>
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
                {products.filter(p => p.alreadyAdded).length}
              </p>
              <p className="text-sm text-slate-500">In Your Store</p>
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
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">All Brands</option>
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                {product.origin}
              </div>
              {product.alreadyAdded && (
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Added
                </div>
              )}
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
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {product.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  product.stock > 10
                    ? 'bg-green-100 text-green-700'
                    : product.stock > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock} available
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-900">${product.price}</span>
                  {product.mrp && (
                    <span className="text-sm text-slate-400 line-through ml-2">
                      ${product.mrp}
                    </span>
                  )}
                </div>
                {product.alreadyAdded ? (
                  <button
                    disabled
                    className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium cursor-default"
                  >
                    <CheckCircle2 size={16} />
                    Added
                  </button>
                ) : (
                  <button
                    onClick={() => addToStore(product.id)}
                    disabled={addingProduct === product.id || product.stock === 0}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingProduct === product.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery || selectedCategory || selectedManufacturer
              ? 'No products match your filters'
              : 'No products available yet'
            }
          </h3>
          <p className="text-slate-500">
            {searchQuery || selectedCategory || selectedManufacturer
              ? 'Try adjusting your search or filters'
              : 'Check back soon - admin is adding new products!'
            }
          </p>
        </div>
      )}
    </div>
  );
}
