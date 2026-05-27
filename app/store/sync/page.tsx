'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface InventoryItem {
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  purchasedQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  unitCost: number;
  currentRetailPrice: number;
  syncedToPublic: boolean;
  publicProductId?: string;
}

interface PublicProduct {
  stock_quantity: number;
  id: string;
  name: string;
  price: number;
  stock: number;
  inStock: boolean;
  inventoryProductId: string;
}

export default function InventorySyncPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [publicProducts, setPublicProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch inventory
      const invResponse = await fetch('/api/store/inventory-sync');
      const invData = await invResponse.json();
      
      if (invResponse.ok) {
        setInventory(invData.unsyncedItems || []);
      }

      // Fetch public products
      const pubResponse = await fetch('/api/store/public-products');
      const pubData = await pubResponse.json();
      
      if (pubResponse.ok) {
        setPublicProducts(pubData.products || []);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const syncToPublic = async (item: InventoryItem) => {
    setSyncing(item.productId);
    try {
      const response = await fetch('/api/store/inventory-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryProductId: item.productId,
          customPrice: item.currentRetailPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Product synced to public store!');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to sync');
      }
    } catch (error) {
      toast.error('Failed to sync product');
    } finally {
      setSyncing(null);
    }
  };

  const unsyncFromPublic = async (publicProductId: string) => {
    try {
      const response = await fetch(`/api/store/inventory-sync?publicProductId=${publicProductId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product removed from public store');
        fetchData();
      } else {
        toast.error('Failed to remove product');
      }
    } catch (error) {
      toast.error('Failed to remove product');
    }
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Sync to Public Store</h1>
        <p className="text-slate-500 mt-1">
          Make your wholesale inventory visible to customers on your public shop
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="text-slate-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
              <p className="text-sm text-slate-500">Ready to Sync</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{publicProducts.length}</p>
              <p className="text-sm text-slate-500">Public Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {publicProducts.filter(p => p.inStock).length}
              </p>
              <p className="text-sm text-slate-500">In Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unsynced Inventory */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package size={18} />
              Inventory Ready to Sync
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {inventory.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{item.productName}</h3>
                  <p className="text-sm text-slate-500">{item.manufacturer} • {item.category}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-slate-600">
                      <strong>{item.availableQuantity}</strong> in stock
                    </span>
                    <span className="text-slate-600">
                      Cost: <strong>${item.unitCost.toFixed(2)}</strong>
                    </span>
                    <span className="text-green-600">
                      Retail: <strong>${item.currentRetailPrice.toFixed(2)}</strong>
                    </span>
                    <span className="text-green-600">
                      Margin: <strong>{Math.round((item.currentRetailPrice - item.unitCost) / item.currentRetailPrice * 100)}%</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => syncToPublic(item)}
                  disabled={syncing === item.productId}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {syncing === item.productId ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Sync to Public
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Products */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Globe size={18} />
            Public Store Products
          </h2>
          <Link
            href="/shop/happy-shop"
            target="_blank"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View Public Store
            <ExternalLink size={14} />
          </Link>
        </div>

        {publicProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No public products yet</h3>
            <p className="text-slate-500 mb-4">
              Sync items from your inventory to make them visible to customers
            </p>
            <Link
              href="/store/inventory"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800"
            >
              <Package size={18} />
              Go to Inventory
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {publicProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{product.name}</h3>
                    {product.inStock ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-slate-600">
                      Price: <strong>${product.price.toFixed(2)}</strong>
                    </span>
                    <span className="text-slate-600">
                      Stock: <strong>{product.stock_quantity || 0}</strong>
                    </span>
                    <span className="text-slate-400">
                      ID: {product.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/shop/happy-shop`}
                    target="_blank"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <ExternalLink size={18} />
                  </Link>
                  <button
                    onClick={() => unsyncFromPublic(product.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <EyeOff size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
