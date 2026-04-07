'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  DollarSign,
  Plus,
  Minus,
  Edit2,
  CheckCircle2,
  Search,
  Filter,
  ShoppingBag,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface StoreInventory {
  productId: string;
  productName: string;
  purchasedQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  unitCost: number;
  currentRetailPrice: number;
  lastRestockedAt: string;
  lowStockThreshold: number;
  manufacturer: string;
  category: string;
  image?: string;
}

export default function StoreInventoryPage() {
  const [inventory, setInventory] = useState<StoreInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Mock data - in production this would come from API
  useEffect(() => {
    setTimeout(() => {
      setInventory([
        {
          productId: 'wp_1',
          productName: 'COSRX Advanced Snail 92 Cream',
          purchasedQuantity: 50,
          soldQuantity: 32,
          availableQuantity: 18,
          unitCost: 12.00,
          currentRetailPrice: 28.00,
          lastRestockedAt: '2026-03-15T10:30:00Z',
          lowStockThreshold: 10,
          manufacturer: 'COSRX',
          category: 'Skincare',
        },
        {
          productId: 'wp_2',
          productName: 'Innisfree Green Tea Seed Serum',
          purchasedQuantity: 30,
          soldQuantity: 15,
          availableQuantity: 15,
          unitCost: 15.50,
          currentRetailPrice: 35.00,
          lastRestockedAt: '2026-03-10T14:20:00Z',
          lowStockThreshold: 8,
          manufacturer: 'Innisfree',
          category: 'Skincare',
        },
        {
          productId: 'wp_3',
          productName: 'Beauty of Joseon Glow Serum',
          purchasedQuantity: 100,
          soldQuantity: 67,
          availableQuantity: 33,
          unitCost: 9.80,
          currentRetailPrice: 22.00,
          lastRestockedAt: '2026-03-20T09:15:00Z',
          lowStockThreshold: 15,
          manufacturer: 'Beauty of Joseon',
          category: 'Skincare',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const updatePrice = (productId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, currentRetailPrice: newPrice }
          : item
      )
    );
    setEditingPrice(null);
    toast.success('Price updated successfully');
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.availableQuantity <= item.lowStockThreshold);
  };

  const getInventoryStats = () => {
    const totalInvested = inventory.reduce((sum, item) => 
      sum + (item.purchasedQuantity * item.unitCost), 0
    );
    const totalRevenue = inventory.reduce((sum, item) => 
      sum + (item.soldQuantity * item.currentRetailPrice), 0
    );
    const totalProfit = inventory.reduce((sum, item) => 
      sum + (item.soldQuantity * (item.currentRetailPrice - item.unitCost)), 0
    );
    const totalProducts = inventory.length;
    const lowStockCount = getLowStockItems().length;

    return {
      totalInvested,
      totalRevenue,
      totalProfit,
      totalProducts,
      lowStockCount,
    };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = getInventoryStats();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Inventory</h1>
          <p className="text-slate-500 mt-1">
            Manage products bought from wholesale suppliers
          </p>
        </div>
        <Link
          href="/store/wholesale"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-colors shadow-lg"
        >
          <Plus size={18} />
          Buy More Stock
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
              <p className="text-sm text-slate-500">Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.lowStockCount}</p>
              <p className="text-sm text-slate-500">Low Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-slate-500">Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${stats.totalProfit.toFixed(0)}</p>
              <p className="text-sm text-slate-500">Profit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Low Stock Alert</h3>
              <p className="text-sm text-amber-700">
                {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's are' : ' is'} running low. 
                <Link href="/store/wholesale" className="underline font-medium ml-1">
                  Restock now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-pink-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-pink-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
          >
            <option value="">All Categories</option>
            <option value="Skincare">Skincare</option>
            <option value="Makeup">Makeup</option>
            <option value="Haircare">Haircare</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-pink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Product</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Stock</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Unit Cost</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Retail Price</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Margin</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Sales</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {filteredInventory.map((item) => {
                const margin = ((item.currentRetailPrice - item.unitCost) / item.currentRetailPrice * 100).toFixed(1);
                const totalProfit = item.soldQuantity * (item.currentRetailPrice - item.unitCost);
                const isLowStock = item.availableQuantity <= item.lowStockThreshold;

                return (
                  <tr key={item.productId} className="hover:bg-pink-50/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="text-pink-500" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.productName}</p>
                          <p className="text-sm text-pink-600">{item.manufacturer} • {item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isLowStock 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.availableQuantity} available
                        </span>
                        <p className="text-xs text-slate-400">
                          {item.purchasedQuantity} bought / {item.soldQuantity} sold
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600">
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {editingPrice === item.productId ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 border border-pink-200 rounded text-right focus:outline-none focus:ring-2 focus:ring-pink-500"
                            min={item.unitCost}
                            step={0.01}
                          />
                          <button
                            onClick={() => updatePrice(item.productId)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-slate-900">${item.currentRetailPrice.toFixed(2)}</span>
                          <button
                            onClick={() => {
                              setEditingPrice(item.productId);
                              setNewPrice(item.currentRetailPrice);
                            }}
                            className="text-pink-400 hover:text-pink-600"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-green-600 font-medium">{margin}%</span>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600">
                      {item.soldQuantity} units
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-green-600">+${totalProfit.toFixed(2)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="p-12 text-center">
            <Warehouse className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No inventory yet</h3>
            <p className="text-slate-500 mb-4">
              You haven&apos;t purchased any wholesale products yet
            </p>
            <Link
              href="/store/wholesale"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <ShoppingBag size={18} />
              Browse Wholesale Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
