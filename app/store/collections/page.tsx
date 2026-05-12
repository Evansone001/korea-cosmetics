'use client';

import { useState, useEffect } from 'react';
import {
  FolderPlus,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  MoreVertical,
  GripVertical,
  Package,
  Image as ImageIcon,
  X
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { apiClient, StoreProduct } from '@/lib/api-client';

// Helper to get full image URL
const getImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  return `${backendUrl}${path}`;
};

interface Collection {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  coverImage?: string;
  isFeatured: boolean;
  sortOrder: number;
  productCount?: number;
}

export default function StoreCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddProductsDialog, setShowAddProductsDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Form states
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionStatus, setCollectionStatus] = useState<'active' | 'inactive' | 'draft'>('active');
  const [collectionFeatured, setCollectionFeatured] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      // For now, mock data since the backend collection API isn't fully implemented
      const mockCollections: Collection[] = [
        {
          id: '1',
          name: 'Best Sellers',
          description: 'Our most popular products',
          status: 'active',
          isFeatured: true,
          sortOrder: 1,
          productCount: 12
        },
        {
          id: '2',
          name: 'New Arrivals',
          description: 'Fresh from Korea',
          status: 'active',
          isFeatured: false,
          sortOrder: 2,
          productCount: 8
        },
        {
          id: '3',
          name: 'Summer Special',
          description: 'Perfect for summer skincare',
          status: 'draft',
          isFeatured: false,
          sortOrder: 3,
          productCount: 5
        }
      ];
      setCollections(mockCollections);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getStoreProductCatalog({
        status: 'active',
        limit: 100
      });
      setProducts(response?.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      // Mock create - in real implementation, call API
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: collectionName,
        description: collectionDescription,
        status: collectionStatus,
        isFeatured: collectionFeatured,
        sortOrder: collections.length + 1,
        productCount: 0
      };

      setCollections([...collections, newCollection]);
      setShowCreateDialog(false);
      setCollectionName('');
      setCollectionDescription('');
      setCollectionStatus('active');
      setCollectionFeatured(false);
      toast.success('Collection created successfully');
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection) return;

    try {
      // Mock update - in real implementation, call API
      setCollections(collections.map(c => 
        c.id === selectedCollection.id 
          ? { ...c, name: collectionName, description: collectionDescription, status: collectionStatus, isFeatured: collectionFeatured }
          : c
      ));
      setShowEditDialog(false);
      setSelectedCollection(null);
      toast.success('Collection updated successfully');
    } catch (error) {
      console.error('Failed to update collection:', error);
      toast.error('Failed to update collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      // Mock delete - in real implementation, call API
      setCollections(collections.filter(c => c.id !== collectionId));
      toast.success('Collection deleted successfully');
    } catch (error) {
      console.error('Failed to delete collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const handleToggleFeatured = async (collectionId: string) => {
    try {
      setCollections(collections.map(c => 
        c.id === collectionId ? { ...c, isFeatured: !c.isFeatured } : c
      ));
      toast.success('Collection featured status updated');
    } catch (error) {
      console.error('Failed to update collection:', error);
      toast.error('Failed to update collection');
    }
  };

  const handleAddProductsToCollection = () => {
    if (!selectedCollection) return;

    // Mock add products - in real implementation, call API
    const updatedCollections = collections.map(c => 
      c.id === selectedCollection.id 
        ? { ...c, productCount: (c.productCount || 0) + selectedProducts.length }
        : c
    );
    setCollections(updatedCollections);
    setShowAddProductsDialog(false);
    setSelectedProducts([]);
    setSelectedCollection(null);
    toast.success(`${selectedProducts.length} products added to collection`);
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Collections</h1>
          <p className="text-gray-600">Organize your products into themed collections for better discovery</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <FolderPlus className="h-4 w-4" />
          Create Collection
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <div
            key={collection.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Collection Cover */}
            <div className="relative h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
              {collection.coverImage ? (
                <Image
                  src={getImageUrl(collection.coverImage)}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <FolderPlus className="h-16 w-16 text-pink-300" />
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3 flex gap-2">
                {collection.isFeatured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  collection.status === 'active' ? 'bg-green-100 text-green-800' :
                  collection.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {collection.status}
                </span>
              </div>

              {/* Product Count */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                {collection.productCount || 0} products
              </div>
            </div>

            {/* Collection Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-lg">{collection.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{collection.description}</p>
                </div>
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedCollection(collection);
                    setCollectionName(collection.name);
                    setCollectionDescription(collection.description);
                    setCollectionStatus(collection.status);
                    setCollectionFeatured(collection.isFeatured);
                    setShowEditDialog(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                
                <button
                  onClick={() => handleToggleFeatured(collection.id)}
                  className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                  title={collection.isFeatured ? 'Remove Featured' : 'Make Featured'}
                >
                  <Star className={`h-4 w-4 ${collection.isFeatured ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => {
                    setSelectedCollection(collection);
                    setSelectedProducts([]);
                    setShowAddProductsDialog(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first collection to organize your products'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              Create Your First Collection
            </button>
          )}
        </div>
      )}

      {/* Create Collection Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Collection</h2>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="e.g., Best Sellers, Summer Collection"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={collectionDescription}
                    onChange={(e) => setCollectionDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe what this collection contains"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={collectionStatus}
                    onChange={(e) => setCollectionStatus(e.target.value as 'active' | 'inactive' | 'draft')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={collectionFeatured}
                    onChange={(e) => setCollectionFeatured(e.target.checked)}
                    className="h-4 w-4 text-pink-600 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Feature this collection
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Create Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Collection Dialog */}
      {showEditDialog && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Collection</h2>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={collectionDescription}
                    onChange={(e) => setCollectionDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={collectionStatus}
                    onChange={(e) => setCollectionStatus(e.target.value as 'active' | 'inactive' | 'draft')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={collectionFeatured}
                    onChange={(e) => setCollectionFeatured(e.target.checked)}
                    className="h-4 w-4 text-pink-600 rounded"
                  />
                  <label htmlFor="edit-featured" className="ml-2 text-sm text-gray-700">
                    Feature this collection
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
                  onClick={handleUpdateCollection}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Products Dialog */}
      {showAddProductsDialog && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Products to "{selectedCollection.name}"
                </h2>
                <button
                  onClick={() => setShowAddProductsDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProducts(prev =>
                        prev.includes(product.id)
                          ? prev.filter(id => id !== product.id)
                          : [...prev, product.id]
                      );
                    }}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedProducts.includes(product.id)
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      <Image
                        src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder-product.png'}
                        alt={product.productName}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{product.productName}</h4>
                        <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-pink-600 rounded mt-2"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} products selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddProductsDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProductsToCollection}
                    disabled={selectedProducts.length === 0}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add {selectedProducts.length} Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
