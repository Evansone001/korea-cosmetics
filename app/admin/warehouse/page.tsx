'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, Search, RefreshCw, Edit2, Trash2, Store, DollarSign, Box, ExternalLink, Info, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

interface WarehouseProduct {
  id: string
  name: string
  description: string
  category: string
  brand?: string
  customer_type: 'B2C' | 'B2B' | 'BOTH'
  warehouse_stock: number
  b2c_retail_price: number | null
  b2b_wholesale_price: number | null
  b2b_moq: number
  status: string
  sku?: string
}

export default function AdminWarehousePage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<WarehouseProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('ALL')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<WarehouseProduct | null>(null)
  const [formData, setFormData] = useState({name: '', description: '', category: '', brand: '', customer_type: 'BOTH' as 'B2C' | 'B2B' | 'BOTH', warehouse_stock: 0, b2c_retail_price: '', b2b_wholesale_price: '', b2b_moq: 1, sku: ''})

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (customerTypeFilter !== 'ALL') params.customer_type = customerTypeFilter
      const response = await apiClient.getWarehouseProducts(params)
      setProducts(response.products || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch warehouse products", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [customerTypeFilter])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdate = async () => {
    if (!selectedProduct) return
    try {
      const data = {...formData, b2c_retail_price: formData.b2c_retail_price ? parseFloat(formData.b2c_retail_price) : null, b2b_wholesale_price: formData.b2b_wholesale_price ? parseFloat(formData.b2b_wholesale_price) : null}
      await apiClient.updateWarehouseProduct(selectedProduct.id, data)
      toast({ title: "Success", description: "Product updated" })
      setIsEditDialogOpen(false)
      fetchProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update product", variant: "destructive" })
    }
  }

  const handleDelete = async (product: WarehouseProduct) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await apiClient.deleteWarehouseProduct(product.id)
      toast({ title: "Success", description: "Product deleted" })
      fetchProducts()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" })
    }
  }

  const openEdit = (product: WarehouseProduct) => {
    setSelectedProduct(product)
    setFormData({name: product.name, description: product.description, category: product.category, brand: product.brand || '', customer_type: product.customer_type, warehouse_stock: product.warehouse_stock, b2c_retail_price: product.b2c_retail_price?.toString() || '', b2b_wholesale_price: product.b2b_wholesale_price?.toString() || '', b2b_moq: product.b2b_moq, sku: product.sku || ''})
    setIsEditDialogOpen(true)
  }

  const b2cProducts = products.filter(p => p.customer_type === 'B2C' || p.customer_type === 'BOTH')
  const b2bProducts = products.filter(p => p.customer_type === 'B2B' || p.customer_type === 'BOTH')
  const lowStock = products.filter(p => p.warehouse_stock < 50)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Warehouse Inventory</h1>
          <p className="text-slate-500 mt-1">Manage stock levels and pricing for warehouse-enabled products</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Link href="/admin/catalog">
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
              <ExternalLink className="w-4 h-4" /> Manage Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Products are managed in the Catalog</p>
          <p className="text-blue-600">Use the Catalog page to add new products and enable them for warehouse inventory. This page is for managing stock levels and pricing tiers.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Total Products</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">B2C Products</span>
            <Store className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{b2cProducts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">B2B Products</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{b2bProducts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{lowStock.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="B2C">B2C Only</option>
            <option value="B2B">B2B Only</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">B2C Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">B2B Price (MOQ)</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No products found</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {(product as any).images && (product as any).images.length > 0 ? (
                          <img
                            src={(product as any).images[0].startsWith('http') ? (product as any).images[0] : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${(product as any).images[0]}`}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Box className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand} • {product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        product.customer_type === 'B2C' ? 'bg-green-100 text-green-700 border-green-200' :
                        product.customer_type === 'B2B' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {product.customer_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className={product.warehouse_stock < 50 ? 'text-red-600 font-medium' : ''}>
                        {product.warehouse_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.b2c_retail_price ? `$${product.b2c_retail_price}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.b2b_wholesale_price ? `$${product.b2b_wholesale_price} (MOQ: {product.b2b_moq})` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(product)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Edit Warehouse Product</h2>
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 h-24 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Customer Type *
                </label>
                <Select value={formData.customer_type} onValueChange={(v: 'B2C' | 'B2B' | 'BOTH') => setFormData({...formData, customer_type: v})}>
                  <SelectTrigger className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2C">B2C (Resellers)</SelectItem>
                    <SelectItem value="B2B">B2B (Wholesalers)</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  B2C Retail Price ($)
                </label>
                <input
                  type="number"
                  value={formData.b2c_retail_price}
                  onChange={(e) => setFormData({...formData, b2c_retail_price: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  B2B Wholesale Price ($)
                </label>
                <input
                  type="number"
                  value={formData.b2b_wholesale_price}
                  onChange={(e) => setFormData({...formData, b2b_wholesale_price: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  B2B MOQ
                </label>
                <input
                  type="number"
                  value={formData.b2b_moq}
                  onChange={(e) => setFormData({...formData, b2b_moq: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Warehouse Stock
                </label>
                <input
                  type="number"
                  value={formData.warehouse_stock}
                  onChange={(e) => setFormData({...formData, warehouse_stock: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  min="0"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-6 py-2 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
