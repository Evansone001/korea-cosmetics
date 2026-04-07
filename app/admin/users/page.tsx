'use client'
import { useState } from 'react'
import { 
    Search, Filter, MoreHorizontal, Shield, Store, User, 
    CheckCircle, XCircle, Clock, Edit2, Ban, Unlock,
    ChevronDown, Download, Plus, Mail, Phone
} from 'lucide-react'

interface UserData {
    id: string
    name: string
    email: string
    phone?: string
    role: 'admin' | 'seller' | 'customer'
    status: 'active' | 'suspended' | 'banned'
    joinedDate: string
    lastActive: string
    ordersCount: number
    totalSpent: number
    avatar?: string
}

const ROLE_PERMISSIONS = {
    admin: {
        label: 'Administrator',
        description: 'Full access to all features',
        color: 'bg-purple-100 text-purple-700',
        icon: Shield,
        permissions: ['users.manage', 'stores.manage', 'products.manage', 'orders.view', 'analytics.view', 'settings.manage']
    },
    seller: {
        label: 'Seller',
        description: 'Can manage own store and products',
        color: 'bg-blue-100 text-blue-700',
        icon: Store,
        permissions: ['store.manage', 'products.manage', 'orders.view', 'analytics.view']
    },
    customer: {
        label: 'Customer',
        description: 'Can browse and purchase products',
        color: 'bg-green-100 text-green-700',
        icon: User,
        permissions: ['products.view', 'orders.create', 'profile.manage']
    }
}

export default function AdminUsers() {
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'seller' | 'customer'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [showRoleModal, setShowRoleModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

    // Sample users data
    const [users, setUsers] = useState<UserData[]>([
        {
            id: 'user_1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+254 712 345 678',
            role: 'admin',
            status: 'active',
            joinedDate: '2026-01-15',
            lastActive: '2 min ago',
            ordersCount: 0,
            totalSpent: 0
        },
        {
            id: 'user_2',
            name: 'Jane Doe',
            email: 'jane.doe@kbeauty.com',
            phone: '+254 723 456 789',
            role: 'seller',
            status: 'active',
            joinedDate: '2026-02-20',
            lastActive: '15 min ago',
            ordersCount: 156,
            totalSpent: 458900
        },
        {
            id: 'user_3',
            name: 'Alice Johnson',
            email: 'alice.j@example.com',
            phone: '+254 734 567 890',
            role: 'customer',
            status: 'active',
            joinedDate: '2026-03-10',
            lastActive: '1 hour ago',
            ordersCount: 12,
            totalSpent: 45600
        },
        {
            id: 'user_4',
            name: 'Bob Williams',
            email: 'bob.w@example.com',
            role: 'customer',
            status: 'suspended',
            joinedDate: '2026-01-25',
            lastActive: '3 days ago',
            ordersCount: 5,
            totalSpent: 12300
        },
        {
            id: 'user_5',
            name: 'Carol Martinez',
            email: 'carol.m@seoulglow.co.ke',
            phone: '+254 745 678 901',
            role: 'seller',
            status: 'active',
            joinedDate: '2026-02-15',
            lastActive: '30 min ago',
            ordersCount: 89,
            totalSpent: 234500
        },
        {
            id: 'user_6',
            name: 'David Brown',
            email: 'david.b@example.com',
            role: 'customer',
            status: 'banned',
            joinedDate: '2026-01-10',
            lastActive: 'Never',
            ordersCount: 0,
            totalSpent: 0
        }
    ])

    const handleRoleChange = (userId: string, newRole: 'admin' | 'seller' | 'customer') => {
        setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
        ))
        setShowRoleModal(false)
    }

    const handleStatusChange = (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
        setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
        ))
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    const getStatusColor = (status: UserData['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'suspended':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'banned':
                return 'bg-red-100 text-red-700 border-red-200'
        }
    }

    const getStatusIcon = (status: UserData['status']) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4" />
            case 'suspended':
                return <Clock className="w-4 h-4" />
            case 'banned':
                return <Ban className="w-4 h-4" />
        }
    }

    const RoleBadge = ({ role }: { role: UserData['role'] }) => {
        const config = ROLE_PERMISSIONS[role]
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage user accounts, roles, and permissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                        <Plus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total Users</span>
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                    <p className="text-xs text-green-600 mt-1">+12 this month</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Admins</span>
                        <Shield className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Sellers</span>
                        <Store className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === 'seller').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Customers</span>
                        <User className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === 'customer').length}</p>
                </div>
            </div>

            {/* Role Permissions Info */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-5 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Role Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => (
                        <div key={role} className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <config.icon className="w-5 h-5" />
                                <span className="font-medium text-slate-800">{config.label}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{config.description}</p>
                            <div className="flex flex-wrap gap-1">
                                {config.permissions.slice(0, 3).map((perm, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                        {perm.split('.')[0]}
                                    </span>
                                ))}
                                {config.permissions.length > 3 && (
                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                        +{config.permissions.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                            <option value="customer">Customer</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUsers(filteredUsers.map(u => u.id))
                                            } else {
                                                setSelectedUsers([])
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">User</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Joined</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Last Active</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Activity</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers([...selectedUsers, user.id])
                                                } else {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-white font-medium">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{user.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(user.status)}`}>
                                            {getStatusIcon(user.status)}
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(user.joinedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {user.lastActive}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="text-slate-800 font-medium">{user.ordersCount} orders</p>
                                            <p className="text-slate-500">KShs {user.totalSpent.toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setShowRoleModal(true)
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                                title="Change Role"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {user.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleStatusChange(user.id, 'suspended')}
                                                    className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-colors"
                                                    title="Suspend"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                            ) : user.status === 'suspended' ? (
                                                <button 
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                                    title="Activate"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                                    title="Unban"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleStatusChange(user.id, user.status === 'banned' ? 'active' : 'banned')}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                title={user.status === 'banned' ? 'Unban' : 'Ban'}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No users found</p>
                    </div>
                )}
            </div>

            {/* Role Change Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Change User Role</h3>
                        <p className="text-slate-500 mb-6">
                            Select a new role for <span className="font-medium text-slate-800">{selectedUser.name}</span>
                        </p>
                        
                        <div className="space-y-3 mb-6">
                            {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => {
                                const Icon = config.icon
                                return (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleChange(selectedUser.id, role as any)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                            selectedUser.role === role 
                                                ? 'border-slate-900 bg-slate-50' 
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${config.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-medium text-slate-800">{config.label}</p>
                                            <p className="text-xs text-slate-500">{config.description}</p>
                                        </div>
                                        {selectedUser.role === role && (
                                            <CheckCircle className="w-5 h-5 text-slate-900" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                        
                        <button 
                            onClick={() => setShowRoleModal(false)}
                            className="w-full py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
