'use client'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { PackageIcon, DollarSignIcon, ShoppingCartIcon, UsersIcon } from 'lucide-react'
import { dummyStoreData, productDummyData } from '@/assets/assets'

export default function StoreDashboard() {
    const products = useAppSelector(state => state.product.list)
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0
    })

    useEffect(() => {
        // Calculate stats from dummy data
        setStats({
            totalProducts: products.length,
            totalOrders: 12, // Dummy data
            totalRevenue: 4592.50, // Dummy data
            totalCustomers: 8 // Dummy data
        })
    }, [products])

    const statCards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: PackageIcon,
            bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
            change: '+2 from last month'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCartIcon,
            bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600',
            change: '+5 from last month'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSignIcon,
            bgColor: 'bg-gradient-to-br from-pink-600 to-rose-600',
            change: '+12% from last month'
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: UsersIcon,
            bgColor: 'bg-gradient-to-br from-rose-400 to-pink-500',
            change: '+3 from last month'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Store Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome back! Here's an overview of your store performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                <p className="text-sm text-pink-600 mt-2">{stat.change}</p>
                            </div>
                            <div className={`${stat.bgColor} p-3 rounded-xl shadow-lg`}>
                                <stat.icon size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h2>
                    <div className="space-y-3">
                        {[
                            { id: '#12345', customer: 'John Doe', amount: '$89.99', status: 'Completed' },
                            { id: '#12346', customer: 'Jane Smith', amount: '$149.99', status: 'Processing' },
                            { id: '#12347', customer: 'Bob Johnson', amount: '$59.99', status: 'Pending' },
                        ].map((order, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                                <div>
                                    <p className="font-medium text-slate-900">{order.id}</p>
                                    <p className="text-sm text-slate-600">{order.customer}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">{order.amount}</p>
                                    <p className={`text-sm ${
                                        order.status === 'Completed' ? 'text-green-600' :
                                        order.status === 'Processing' ? 'text-pink-600' :
                                        'text-amber-600'
                                    }`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Products</h2>
                    <div className="space-y-3">
                        {products.slice(0, 4).map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{product.name}</p>
                                        <p className="text-sm text-pink-600">{product.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">${product.price}</p>
                                    <p className="text-sm text-slate-600">{Math.floor(Math.random() * 50) + 10} sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <PackageIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Add Product</p>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <ShoppingCartIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">View Orders</p>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <DollarSignIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Analytics</p>
                    </button>
                    <button className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-700 rounded-xl border border-pink-200 hover:shadow-md hover:border-pink-300 transition-all text-center">
                        <UsersIcon size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Customers</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
