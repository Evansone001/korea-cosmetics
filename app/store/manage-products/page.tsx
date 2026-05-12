'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Upload,
  Download
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient, StoreProduct, AvailableProduct, AddProductToCatalogRequest, BulkUpdateRequest } from '@/lib/api-client';

// Helper to get full image URL
const getImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  return `${backendUrl}${path}`;
};

export default function StoreManageProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [addingProduct, setAddingProduct] = useState<string | null>(null);

  // Form states for adding product
  const [selectedAvailableProduct, setSelectedAvailableProduct] = useState<AvailableProduct | null>(null);
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productFeatured, setProductFeatured] = useState(false);
  const [productDescription, setProductDescription] = useState('');

  useEffect(() => {
    fetchStoreProducts();
  }, [selectedStatus, selectedCategory]);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStoreProductCatalog({
        status: selectedStatus,
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

  const fetchAvailableProducts = async () => {
    try {
      const response = await apiClient.getAvailableProducts({
        query: searchQuery,
        category: selectedCategory || undefined,
        limit: 20
      });
      setAvailableProducts(response?.products || []);
    } catch (error) {
      console.error('Failed to fetch available products:', error);
      toast.error('Failed to load available products');
    }
  };

  const handleAddProduct = async () => {
    if (!selectedAvailableProduct || !productPrice || !productStock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAddingProduct(selectedAvailableProduct.id);
    try {
      const requestData: AddProductToCatalogRequest = {
        productId: selectedAvailableProduct.id,
        price: parseFloat(productPrice),
        stockQuantity: parseInt(productStock),
        featured: productFeatured,
        customDescription: productDescription || undefined
      };

      await apiClient.addProductToCatalog(requestData);
      toast.success('Product added to catalog successfully');
      setShowAddDialog(false);
      fetchStoreProducts();
      
      // Reset form
      setSelectedAvailableProduct(null);
      setProductPrice('');
      setProductStock('');
      setProductFeatured(false);
      setProductDescription('');
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setAddingProduct(null);
    }
  };

  const handleUpdateProduct = async (updates: Partial<StoreProduct>) => {
    if (!editingProduct) return;

    try {
      await apiClient.updateStoreProduct(editingProduct.id, updates);
      toast.success('Product updated successfully');
      setShowEditDialog(false);
      fetchStoreProducts();
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product from your catalog?')) {
      return;
    }

    try {
      await apiClient.removeProductFromCatalog(productId);
      toast.success('Product removed from catalog');
      fetchStoreProducts();
    } catch (error: any) {
      console.error('Failed to remove product:', error);
      toast.error(error.message || 'Failed to remove product');
    }
  };

  const handleBulkUpdate = async (operation: string) => {
    if (selectedProducts.length === 0) return;

    try {
      const requestData: BulkUpdateRequest = {
        operation: operation as any,
        productIds: selectedProducts
      };

      await apiClient.bulkUpdateStoreProducts(requestData);
      
      let message = '';
      switch (operation) {
        case 'activate':
          message = 'Products activated successfully';
          break;
        case 'deactivate':
          message = 'Products deactivated successfully';
          break;
        case 'toggle_featured':
          message = 'Featured status updated successfully';
          break;
        default:
          message = 'Products updated successfully';
      }

      toast.success(message);
      setSelectedProducts([]);
      setShowBulkActions(false);
      fetchStoreProducts();
    } catch (error: any) {
      console.error('Failed to bulk update:', error);
      toast.error(error.message || 'Failed to update products');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Get unique categories from products
  const categories = ['', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Inventory</h1>
        <p className="text-gray-600">Manage your current stock levels, pricing, and product availability</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Category Filter */}
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

            {/* View Mode Toggle */}
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

          <div className="flex gap-2">
            {/* Add Stock Button */}
            <button
              onClick={() => {
                fetchAvailableProducts();
                setShowAddDialog(true);
              }}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </button>
            
            {/* Update Pricing Button */}
            <button
              onClick={() => {
                if (selectedProducts.length > 0) {
                  setShowBulkActions(true);
                } else {
                  toast.error('Please select products to update pricing');
                }
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Update Pricing
            </button>

            {/* Bulk Actions (shown when products are selected) */}
            {showBulkActions && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} selected
                </span>
                
                <button
                  onClick={() => handleBulkUpdate('activate')}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  Activate
                </button>
                
                <button
                  onClick={() => handleBulkUpdate('deactivate')}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Deactivate
                </button>
                
                <button
                  onClick={() => handleBulkUpdate('toggle_featured')}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  Toggle Featured
                </button>

                <button
                  onClick={() => {
                    setSelectedProducts([]);
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products in inventory</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Add products to your store inventory to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  fetchAvailableProducts();
                  setShowAddDialog(true);
                }}
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Products to Inventory
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6' : 'divide-y divide-gray-200'}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={viewMode === 'grid' ? 'border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow' : 'p-4 hover:bg-gray-50'}
              >
                {viewMode === 'grid' ? (
                  <div>
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={getImageUrl(product.images[0])}
                          alt={product.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {product.status === 'active' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                          {product.productName}
                        </h3>
                        <button
                          onClick={() => toggleProductSelection(product.id)}
                          className={`p-2 rounded ${selectedProducts.includes(product.id) ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => {}}
                            className="sr-only"
                          />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="text-2xl font-bold text-pink-600">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            Stock: {product.stockQuantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{product.category}</span>
                        <span>{product.brand}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowEditDialog(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 text-pink-600 rounded"
                      />
                      
                      <Image
                        src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-product.png'}
                        alt={product.productName}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-pink-600">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            Stock: {product.stockQuantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {product.featured && (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                      
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditDialog(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && !showBulkActions && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {selectedProducts.length} products selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkActions(true)}
                className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 text-sm"
              >
                <MoreVertical className="h-4 w-4" />
                Bulk Actions
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Products to Inventory</h2>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Available Products */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Warehouse Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedAvailableProduct(product)}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAvailableProduct?.id === product.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-4">
                        <Image
                          src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-product.png'}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-sm text-gray-500">Stock: {product.warehouseStock}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details Form */}
              {selectedAvailableProduct && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={selectedAvailableProduct.name}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Retail Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Description
                      </label>
                      <textarea
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        rows={3}
                        placeholder="Optional custom description for your store"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={productFeatured}
                        onChange={(e) => setProductFeatured(e.target.checked)}
                        className="h-4 w-4 text-pink-600 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                        Feature this product
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={!selectedAvailableProduct || !productPrice || !productStock || addingProduct !== null}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingProduct === selectedAvailableProduct?.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding to Inventory...
                    </div>
                  ) : (
                    'Add to Inventory'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Dialog */}
      {showEditDialog && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Description
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({...editingProduct, featured: e.target.checked})}
                    className="h-4 w-4 text-pink-600 rounded"
                  />
                  <label htmlFor="edit-featured" className="ml-2 text-sm text-gray-700">
                    Feature this product
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateProduct(editingProduct)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
