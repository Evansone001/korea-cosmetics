'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Star,
  ShoppingCart,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient, StoreProduct, StoreCatalogProduct } from '@/lib/api-client';
import { useParams } from 'next/navigation';

// Helper to get full image URL
const getImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  return `${backendUrl}${path}`;
};

export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  
  const [products, setProducts] = useState<StoreCatalogProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchStoreProducts();
    }
  }, [storeId, selectedCategory]);

  const fetchStoreData = async () => {
    try {
      // Fetch store info and featured products
      const response = await apiClient.getStoreFeaturedProducts(storeId, { limit: 6 });
      setFeaturedProducts(response?.products || []);
      setStoreInfo(response?.store || null);
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    }
  };

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPublicStoreCatalog(storeId, {
        status: 'active',
        category: selectedCategory || undefined,
        limit: 50
      });
      setProducts(response?.products || []);
    } catch (error) {
      console.error('Failed to fetch store products:', error);
      toast.error('Failed to load store products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Get unique categories from products
  const categories = ['', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      {storeInfo && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-6">
              {storeInfo.logo && (
                <Image
                  src={getImageUrl(storeInfo.logo)}
                  alt={storeInfo.name}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold mb-2">{storeInfo.name}</h1>
                <p className="text-pink-100 text-lg mb-4">{storeInfo.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {storeInfo.customerType === 'B2B' ? 'Wholesale Store' : 'Retail Store'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500 fill-current" />
              Featured Products
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-pink-100"
              >
                <div className="relative h-64 bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3 inline mr-1" />
                    Featured
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.productName}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-pink-600">${product.price.toFixed(2)}</span>
                    <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Products</h2>
          <p className="text-gray-600">Browse our complete collection</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category || 'All Categories'}
                  </option>
                ))}
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700'} rounded-l-lg`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700'} rounded-r-lg`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">{cartCount} items</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'This store has no products yet'}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6' : 'divide-y divide-gray-200'}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={viewMode === 'grid' ? 'border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow' : 'p-4 hover:bg-gray-50'}
                >
                  {viewMode === 'grid' ? (
                    <div>
                      <div className="relative h-48 bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={getImageUrl(product.images[0])}
                            alt={product.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        {product.featured && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div>
                            <span className="font-bold text-pink-600">${product.price.toFixed(2)}</span>
                          </div>
                          <button
                            disabled={!product.in_stock}
                            className="flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-product.png'}
                          alt={product.name || 'Product'}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-pink-600">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.featured && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        disabled={!product.in_stock}
                        className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Store Info Footer */}
      {storeInfo && (
        <div className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">About {storeInfo.name}</h3>
                <p className="text-gray-600">{storeInfo.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Store Information</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Open 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Online Store</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Contact Seller</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Seller</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
