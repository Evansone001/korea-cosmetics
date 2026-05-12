'use client'

import { useState, useEffect } from 'react'
import { Package, Search, RefreshCw, CheckCircle, XCircle, Truck, Clock, AlertTriangle, Store, DollarSign, Box, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient, WarehouseOrder } from '@/lib/api-client'

export default function AdminWarehouseOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<WarehouseOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (statusFilter !== 'ALL') params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      
      const response = await apiClient.getAdminWarehouseOrders(params)
      
      setOrders(response?.orders || [])
    } catch (error: any) {
      console.error('Failed to fetch warehouse orders:', error)
      toast({
        title: 'Error',
        description: error?.response?.data?.error || 'Failed to load warehouse orders',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: string, trackingNumber?: string) => {
    try {
      setIsActionLoading(orderId)
      
      await apiClient.handleWarehouseOrderAction(orderId, action, trackingNumber)
      
      toast({
        title: 'Success',
        description: `Order ${action}d successfully`
      })
      
      // Refresh orders
      fetchOrders()
    } catch (error: any) {
      console.error('Failed to handle order action:', error)
      toast({
        title: 'Error',
        description: error?.response?.data?.error || 'Failed to update order',
        variant: 'destructive'
      })
    } finally {
      setIsActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, searchQuery])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Warehouse Orders Management</h1>
        <p className="text-slate-600">Manage and approve warehouse purchase orders from resellers</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search orders by store name or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchOrders} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Warehouse Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No warehouse orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">Order #{order.id.slice(-8)}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </Badge>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Store:</span>
                            <span className="font-medium">{order.storeName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Total:</span>
                            <span className="font-medium">${order.total.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Created:</span>
                            <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">Tracking:</span>
                              <span className="font-medium">{order.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        Order Items
                      </h4>
                      <div className="bg-slate-50 rounded-lg p-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{item.productName}</p>
                              <p className="text-sm text-slate-600">Qty: {item.quantity} × ${item.unitPrice}</p>
                            </div>
                            <p className="font-medium text-slate-900">${item.total}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleOrderAction(order.id, 'approve')}
                            disabled={isActionLoading === order.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isActionLoading === order.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleOrderAction(order.id, 'reject')}
                            disabled={isActionLoading === order.id}
                            variant="destructive"
                          >
                            {isActionLoading === order.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <Button
                          onClick={() => handleOrderAction(order.id, 'ship')}
                          disabled={isActionLoading === order.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isActionLoading === order.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Truck className="w-4 h-4 mr-2" />
                          )}
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => handleOrderAction(order.id, 'deliver')}
                          disabled={isActionLoading === order.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isActionLoading === order.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
