'use client'

import React, { useState, useEffect } from 'react'
import { masterAdminService } from '@/lib/services/masterAdmin'
import { 
    StorePerformance, 
    PlatformMetrics, 
    StoreHealthScore,
    AnomalyEvent 
} from '@/lib/types/masterAdmin'

export default function StoreAnalyticsPage() {
    const [stores, setStores] = useState<StorePerformance[]>([])
    const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedStore, setSelectedStore] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [storesData, metricsData] = await Promise.all([
                masterAdminService.getAllStorePerformance(),
                masterAdminService.getPlatformMetrics()
            ])
            setStores(storesData)
            setPlatformMetrics(metricsData)
        } catch (error) {
            console.error('Failed to load store analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Analytics</h1>
                <p className="text-gray-600">Monitor and analyze store performance across the platform</p>
            </div>

            {/* Platform Overview */}
            {platformMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                        <p className="text-2xl font-bold text-gray-900">
                            ${platformMetrics.totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Active Stores</h3>
                        <p className="text-2xl font-bold text-gray-900">
                            {platformMetrics.activeStores}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                        <p className="text-2xl font-bold text-gray-900">
                            {platformMetrics.totalOrders.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Platform Growth</h3>
                        <p className="text-2xl font-bold text-green-600">
                            +{platformMetrics.platformGrowth}%
                        </p>
                    </div>
                </div>
            )}

            {/* Stores Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Store Performance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Store
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orders
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Growth
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Health Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stores.map((store) => (
                                <tr 
                                    key={store.id} 
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedStore(store.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {store.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {store.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {store.owner}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${store.metrics.revenue.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {store.metrics.orders.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            store.trends.isPositive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {store.trends.isPositive ? '+' : ''}{store.trends.revenueChange}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-900 mr-2">
                                                {store.healthScore}
                                            </div>
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        store.healthScore >= 80 ? 'bg-green-500' :
                                                        store.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${store.healthScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            store.status === 'active' ? 'bg-green-100 text-green-800' :
                                            store.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {store.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
