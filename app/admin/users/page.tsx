'use client'
import { useState, useEffect } from 'react'
import { 
    Search, Filter, MoreHorizontal, Shield, Store, User, 
    CheckCircle, XCircle, Clock, Edit2, Ban, Unlock,
    ChevronDown, Download, Plus, Mail, Phone, Loader2
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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
    const [confirmName, setConfirmName] = useState('')
    const [deleteError, setDeleteError] = useState('')
    
    // Add User modal state
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [newUserData, setNewUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'customer' as 'admin' | 'seller' | 'customer',
        phone: ''
    })
    const [addUserError, setAddUserError] = useState('')
    const [addUserLoading, setAddUserLoading] = useState(false)

    // Fetch users from API
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/auth/admin/users', {
                credentials: 'include'
            })
            
            if (response.status === 401) {
                setError('Unauthorized. Please login as admin.')
                setLoading(false)
                return
            }
            
            if (response.status === 403) {
                setError('Access denied. Admin privileges required.')
                setLoading(false)
                return
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            
            const data = await response.json()
            
            // Transform API response to match UserData interface
            const transformedUsers: UserData[] = data.users.map((user: any) => ({
                id: user.id,
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
                email: user.email,
                phone: user.phone,
                role: (user.role?.toLowerCase() || 'customer') as 'admin' | 'seller' | 'customer',
                status: user.is_active ? 'active' : 'suspended',
                joinedDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
                lastActive: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
                ordersCount: 0, // Can be fetched from orders API
                totalSpent: 0
            }))
            
            setUsers(transformedUsers)
            setError(null)
        } catch (err) {
            setError('Failed to load users. Please try again.')
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    // API functions for user management
    const getTokenFromCookies = () => {
        if (typeof window !== 'undefined') {
            const cookies = document.cookie.split(';')
            const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
            if (authCookie) {
                return authCookie.split('=')[1]
            }
        }
        return null
    }

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const token = getTokenFromCookies()
            const response = await fetch(`/api/auth/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update role')
            }
            
            return true
        } catch (err) {
            console.error('Error updating role:', err)
            alert(err instanceof Error ? err.message : 'Failed to update role')
            return false
        }
    }

    const updateUserStatus = async (userId: string, isActive: boolean) => {
        try {
            const token = getTokenFromCookies()
            const response = await fetch(`/api/auth/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include',
                body: JSON.stringify({ is_active: isActive })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update status')
            }
            
            return true
        } catch (err) {
            console.error('Error updating status:', err)
            alert(err instanceof Error ? err.message : 'Failed to update status')
            return false
        }
    }

    const openDeleteModal = (user: UserData) => {
        setUserToDelete(user)
        setConfirmName('')
        setDeleteError('')
        setShowDeleteModal(true)
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false)
        setUserToDelete(null)
        setConfirmName('')
        setDeleteError('')
    }

    const executeDelete = async () => {
        if (!userToDelete) return
        
        // Verify the name matches
        if (confirmName.trim() !== userToDelete.name) {
            setDeleteError('Name does not match. Please type the exact user name to confirm.')
            return
        }
        
        try {
            const response = await fetch(`/api/auth/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete user')
            }
            
            // Remove user from list
            setUsers(prev => prev.filter(user => user.id !== userToDelete.id))
            closeDeleteModal()
            return true
        } catch (err) {
            console.error('Error deleting user:', err)
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete user')
            return false
        }
    }

    const openAddUserModal = () => {
        setNewUserData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            role: 'customer',
            phone: ''
        })
        setAddUserError('')
        setShowAddUserModal(true)
    }

    const closeAddUserModal = () => {
        setShowAddUserModal(false)
        setAddUserError('')
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddUserError('')
        
        // Validation
        if (!newUserData.first_name || !newUserData.last_name || !newUserData.email || !newUserData.password) {
            setAddUserError('Please fill in all required fields')
            return
        }
        
        if (newUserData.password.length < 8) {
            setAddUserError('Password must be at least 8 characters')
            return
        }
        
        setAddUserLoading(true)
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    first_name: newUserData.first_name,
                    last_name: newUserData.last_name,
                    email: newUserData.email,
                    password: newUserData.password,
                    phone: newUserData.phone || undefined,
                    role: newUserData.role
                })
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user')
            }
            
            // Add new user to list
            const newUser: UserData = {
                id: data.user.id,
                name: `${data.user.first_name} ${data.user.last_name}`,
                email: data.user.email,
                phone: data.user.phone,
                role: data.user.role.toLowerCase() as 'admin' | 'seller' | 'customer',
                status: data.user.is_active ? 'active' : 'suspended',
                joinedDate: data.user.created_at ? new Date(data.user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                lastActive: 'Just now',
                ordersCount: 0,
                totalSpent: 0
            }
            
            setUsers(prev => [...prev, newUser])
            closeAddUserModal()
            alert('User created successfully!')
        } catch (err) {
            console.error('Error creating user:', err)
            setAddUserError(err instanceof Error ? err.message : 'Failed to create user')
        } finally {
            setAddUserLoading(false)
        }
    }

    const [users, setUsers] = useState<UserData[]>([])

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'seller' | 'customer') => {
        const success = await updateUserRole(userId, newRole)
        if (success) {
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ))
            setShowRoleModal(false)
        }
    }

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
        const isActive = newStatus === 'active'
        const success = await updateUserStatus(userId, isActive)
        if (success) {
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, status: newStatus } : user
            ))
        }
    }

    const handleDeleteUser = (user: UserData) => {
        openDeleteModal(user)
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
                    <button 
                        onClick={openAddUserModal}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                    >
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

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-medium text-red-800">{error}</h4>
                            <p className="text-sm text-red-600 mt-1">
                                To create admin/seller accounts, use the CLI: <code className="bg-red-100 px-1.5 py-0.5 rounded">python manage_users.py create-admin &lt;email&gt; &lt;password&gt; &lt;first_name&gt; &lt;last_name&gt;</code>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm">
                    <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-slate-400 animate-spin mb-4" />
                        <p className="text-slate-500">Loading users...</p>
                    </div>
                </div>
            )}

            {/* No Loading/Error - Show Content */}
            {!loading && !error && (
                <>
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
                                            <button 
                                                onClick={() => handleDeleteUser(user)}
                                                className="p-2 hover:bg-red-100 rounded-lg text-red-700 transition-colors"
                                                title="Delete User"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Delete User</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-slate-700 mb-2">
                                You are about to delete: <strong className="text-red-700">{userToDelete.name}</strong>
                            </p>
                            <p className="text-sm text-slate-600">
                                Email: {userToDelete.email}
                            </p>
                        </div>

                        <p className="text-sm text-slate-700 mb-3">
                            To confirm deletion, please type the user's full name below:
                        </p>
                        
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => {
                                setConfirmName(e.target.value)
                                setDeleteError('')
                            }}
                            placeholder={`Type "${userToDelete.name}" to confirm`}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                        />
                        
                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{deleteError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button 
                                onClick={closeDeleteModal}
                                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeDelete}
                                disabled={confirmName !== userToDelete.name}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Add New User</h3>
                        <p className="text-slate-500 mb-6">Create a new user account</p>
                        
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        value={newUserData.first_name}
                                        onChange={(e) => setNewUserData({...newUserData, first_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        value={newUserData.last_name}
                                        onChange={(e) => setNewUserData({...newUserData, last_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={newUserData.email}
                                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={newUserData.password}
                                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="Min 8 characters"
                                    minLength={8}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={newUserData.phone}
                                    onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="+254 712 345 678"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                                <select
                                    value={newUserData.role}
                                    onChange={(e) => setNewUserData({...newUserData, role: e.target.value as 'admin' | 'seller' | 'customer'})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            
                            {addUserError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{addUserError}</p>
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={closeAddUserModal}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={addUserLoading}
                                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {addUserLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    )
}
