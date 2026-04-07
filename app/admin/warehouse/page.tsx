'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  Plus,
  Search,
  Filter,
  ShoppingBag,
  Warehouse,
  ArrowDownRight,
  Building2,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { LandingCostBreakdown } from '@/lib/services/wholesale';

interface WarehouseInventory {
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  unitCost: number;              // Product cost from manufacturer (Korea FOB)
  landingCost: number;           // Total landed cost including shipping, duty, other
  landingCostBreakdown: LandingCostBreakdown;
  wholesalePrice: number;
  retailPrice: number;
  lowStockThreshold: number;
  lastRestockedAt: string;
  origin: string;
}

export default function WarehouseInventoryPage() {
  const [inventory, setInventory] = useState<WarehouseInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<WarehouseInventory | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);

  const categories = ['Skincare', 'Makeup', 'Haircare', 'Bodycare', 'Fragrance'];

  useEffect(() => {
    // Mock data - warehouse inventory from Korean suppliers with landing costs
    setTimeout(() => {
      setInventory([
        {
          productId: 'wp_1',
          productName: 'COSRX Advanced Snail 92 Cream',
          manufacturer: 'COSRX',
          category: 'Skincare',
          totalStock: 500,
          reservedStock: 150,
          availableStock: 350,
          unitCost: 8.50,
          landingCost: 12.60,
          landingCostBreakdown: {
            productCost: 8.50,
            shippingCost: 1.00,
            dutyCost: 2.85,
            otherCost: 0.25
          },
          wholesalePrice: 15.50,
          retailPrice: 28.00,
          lowStockThreshold: 100,
          lastRestockedAt: '2026-03-15T10:30:00Z',
          origin: 'South Korea'
        },
        {
          productId: 'wp_2',
          productName: 'Innisfree Green Tea Seed Serum',
          manufacturer: 'Innisfree',
          category: 'Skincare',
          totalStock: 300,
          reservedStock: 80,
          availableStock: 220,
          unitCost: 10.50,
          landingCost: 15.40,
          landingCostBreakdown: {
            productCost: 10.50,
            shippingCost: 1.20,
            dutyCost: 3.51,
            otherCost: 0.19
          },
          wholesalePrice: 18.50,
          retailPrice: 35.00,
          lowStockThreshold: 60,
          lastRestockedAt: '2026-03-10T14:20:00Z',
          origin: 'South Korea'
        },
        {
          productId: 'wp_3',
          productName: 'Beauty of Joseon Glow Serum',
          manufacturer: 'Beauty of Joseon',
          category: 'Skincare',
          totalStock: 800,
          reservedStock: 200,
          availableStock: 600,
          unitCost: 6.50,
          landingCost: 9.75,
          landingCostBreakdown: {
            productCost: 6.50,
            shippingCost: 0.80,
            dutyCost: 2.19,
            otherCost: 0.26
          },
          wholesalePrice: 11.00,
          retailPrice: 22.00,
          lowStockThreshold: 150,
          lastRestockedAt: '2026-03-20T09:15:00Z',
          origin: 'South Korea'
        },
        {
          productId: 'wp_4',
          productName: 'LANEIGE Lip Sleeping Mask',
          manufacturer: 'LANEIGE',
          category: 'Skincare',
          totalStock: 450,
          reservedStock: 120,
          availableStock: 330,
          unitCost: 7.00,
          landingCost: 10.50,
          landingCostBreakdown: {
            productCost: 7.00,
            shippingCost: 0.90,
            dutyCost: 2.37,
            otherCost: 0.23
          },
          wholesalePrice: 12.50,
          retailPrice: 24.00,
          lowStockThreshold: 80,
          lastRestockedAt: '2026-03-18T16:45:00Z',
          origin: 'South Korea'
        },
        {
          productId: 'wp_5',
          productName: 'Etude House Drawing Eyebrow',
          manufacturer: 'Etude House',
          category: 'Makeup',
          totalStock: 250,
          reservedStock: 60,
          availableStock: 190,
          unitCost: 3.50,
          landingCost: 5.25,
          landingCostBreakdown: {
            productCost: 3.50,
            shippingCost: 0.50,
            dutyCost: 1.20,
            otherCost: 0.05
          },
          wholesalePrice: 6.50,
          retailPrice: 12.00,
          lowStockThreshold: 50,
          lastRestockedAt: '2026-03-12T11:30:00Z',
          origin: 'South Korea'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getLowStockItems = () => {
    return inventory.filter(item => item.availableStock <= item.lowStockThreshold);
  };

  const getInventoryStats = () => {
    // Inventory value based on true landing cost (product + shipping + duty + other)
    const totalValueAtCost = inventory.reduce((sum, item) => 
      sum + (item.totalStock * item.landingCost), 0
    );
    // Potential revenue from B2B sales to stores
    const totalWholesaleValue = inventory.reduce((sum, item) => 
      sum + (item.availableStock * item.wholesalePrice), 0
    );
    // Potential revenue from retail sales
    const totalRetailValue = inventory.reduce((sum, item) => 
      sum + (item.availableStock * item.retailPrice), 0
    );
    const totalProducts = inventory.length;
    const lowStockCount = getLowStockItems().length;

    // True profit calculations using landing cost
    const potentialB2BProfit = inventory.reduce((sum, item) => 
      sum + (item.availableStock * (item.wholesalePrice - item.landingCost)), 0
    );
    const potentialRetailProfit = inventory.reduce((sum, item) => 
      sum + (item.availableStock * (item.retailPrice - item.landingCost)), 0
    );

    return {
      totalValueAtCost,
      totalWholesaleValue,
      totalRetailValue,
      totalProducts,
      lowStockCount,
      potentialB2BProfit,
      potentialRetailProfit
    };
  };

  const handleRestock = () => {
    if (!selectedProduct || restockQuantity <= 0) return;
    
    toast.success(`Order placed for ${restockQuantity} units of ${selectedProduct.productName} from Korea`);
    setShowRestockModal(false);
    setSelectedProduct(null);
    setRestockQuantity(0);
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
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Inventory</h1>
          <p className="text-slate-500 mt-1">
            Manage Kenya warehouse stock from Korean suppliers
          </p>
        </div>
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setShowRestockModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-colors shadow-lg"
        >
          <Plus size={18} />
          Import from Korea
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Warehouse className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${stats.totalValueAtCost.toFixed(0)}</p>
              <p className="text-sm text-slate-500">Inventory at Cost</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${stats.potentialB2BProfit.toFixed(0)}</p>
              <p className="text-sm text-slate-500">B2B Profit Potential</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">${stats.potentialRetailProfit.toFixed(0)}</p>
              <p className="text-sm text-slate-500">Retail Profit Potential</p>
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
                <button 
                  onClick={() => setShowRestockModal(true)}
                  className="underline font-medium ml-1 hover:text-amber-800"
                >
                  Restock from Korea now
                </button>
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
              placeholder="Search warehouse inventory..."
              className="w-full pl-10 pr-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-pink-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Product Cost</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Landing Cost</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">B2B Price</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">Retail Price</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">B2B Margin</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {filteredInventory.map((item) => {
                const isLowStock = item.availableStock <= item.lowStockThreshold;
                // B2B margin based on landing cost (true profit when selling to stores)
                const b2bMargin = ((item.wholesalePrice - item.landingCost) / item.wholesalePrice * 100).toFixed(1);
                const b2bProfitPerUnit = item.wholesalePrice - item.landingCost;

                return (
                  <tr key={item.productId} className="hover:bg-pink-50/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="text-pink-500" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.productName}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-pink-600">{item.manufacturer}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">{item.category}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Building2 size={12} />
                              {item.origin}
                            </span>
                          </div>
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
                          {item.availableStock} available
                        </span>
                        <p className="text-xs text-slate-400">
                          {item.totalStock} total / {item.reservedStock} reserved
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600">
                      ${item.unitCost.toFixed(2)}
                      <p className="text-xs text-slate-400">FOB Korea</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-slate-900">${item.landingCost.toFixed(2)}</span>
                      <p className="text-xs text-slate-400" title={`Shipping $${item.landingCostBreakdown.shippingCost} + Duty $${item.landingCostBreakdown.dutyCost} + Other $${item.landingCostBreakdown.otherCost}`}>
                        +${(item.landingCost - item.unitCost).toFixed(2)} landed
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-slate-900">${item.wholesalePrice.toFixed(2)}</span>
                      <p className="text-xs text-green-600">+${b2bProfitPerUnit.toFixed(2)} profit</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-slate-900">${item.retailPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(b2bMargin) > 20 ? 'bg-green-100 text-green-700' : 
                          parseFloat(b2bMargin) > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {b2bMargin}%
                        </span>
                        <p className="text-xs text-slate-400">B2B margin</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowRestockModal(true);
                        }}
                        className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title="Restock from Korea"
                      >
                        <Truck size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="p-12 text-center">
            <Warehouse className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No inventory yet</h3>
            <p className="text-slate-500 mb-4">
              Start importing products from your Korean suppliers
            </p>
            <button
              onClick={() => setShowRestockModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-colors shadow-lg"
            >
              <Truck size={18} />
              Import from Korea
            </button>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {selectedProduct ? `Restock ${selectedProduct.productName}` : 'Import from Korea'}
            </h3>
            <p className="text-slate-600 mb-6">
              {selectedProduct 
                ? `Order more stock from ${selectedProduct.manufacturer} in South Korea`
                : 'Select a product to import from your Korean suppliers'
              }
            </p>
            
            {selectedProduct && (
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-medium">{selectedProduct.totalStock} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Unit Cost:</span>
                  <span className="font-medium">${selectedProduct.unitCost.toFixed(2)}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                {restockQuantity > 0 && (
                  <div className="bg-pink-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Cost:</span>
                      <span className="font-bold text-slate-900">
                        ${(restockQuantity * selectedProduct.unitCost).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-600">Est. Delivery:</span>
                      <span className="text-slate-900">7-14 days from Korea</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  setSelectedProduct(null);
                  setRestockQuantity(0);
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={!selectedProduct || restockQuantity <= 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedProduct ? 'Place Order' : 'Select Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
