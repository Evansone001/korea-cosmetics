'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Store, 
  MapPin, 
  Phone,
  Package, 
  ShoppingBag, 
  DollarSign,
  Lock,
  Edit2,
  Save,
  X,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import StoreLayout from '@/components/store/StoreLayout'

interface StoreStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
}

export default function StoreProfilePage() {
  const router = useRouter()
  const auth = useSelector((state: any) => state.auth)
  const user = auth.user

  // Personal info state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [name, setName] = useState(user?.name || 'Store Owner')
  const [email, setEmail] = useState(user?.email || "store@KoreaCosmetics.com")
  const [phone, setPhone] = useState('+254 712 345 678')

  // Store info state
  const [isEditingStore, setIsEditingStore] = useState(false)
  const [storeName, setStoreName] = useState('K-Beauty Store')
  const [storeDescription, setStoreDescription] = useState('Premium Korean cosmetics retailer in Nairobi')
  const [storeAddress, setStoreAddress] = useState('123 Kimathi Street, Nairobi, Kenya')
  const [storeUsername, setStoreUsername] = useState('@kbeauty_nairobi')
  const [storeStatus] = useState<'pending' | 'approved' | 'rejected'>('approved')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Mock store stats
  const stats: StoreStats = {
    totalProducts: 45,
    totalOrders: 128,
    totalRevenue: 45600,
    avgOrderValue: 356
  }

  const handleSavePersonal = () => {
    if (!name || !email) {
      toast.error('Name and email are required')
      return
    }
    toast.success('Personal information updated')
    setIsEditingPersonal(false)
  }

  const handleSaveStore = () => {
    if (!storeName || !storeAddress) {
      toast.error('Store name and address are required')
      return
    }
    toast.success('Store information updated')
    setIsEditingStore(false)
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    toast.success('Password changed successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleCancelPersonal = () => {
    setName(user?.name || 'Store Owner')
    setEmail(user?.email || "store@KoreaCosmetics.com")
    setPhone('+254 712 345 678')
    setIsEditingPersonal(false)
  }

  const handleCancelStore = () => {
    setStoreName('K-Beauty Store')
    setStoreDescription('Premium Korean cosmetics retailer in Nairobi')
    setStoreAddress('123 Kimathi Street, Nairobi, Kenya')
    setStoreUsername('@kbeauty_nairobi')
    setIsEditingStore(false)
  }

  return (
    <StoreLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Store Profile</h1>
          <p className="text-slate-500">Manage your store and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal & Store Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl border border-pink-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                </div>
                {!isEditingPersonal ? (
                  <button
                    onClick={() => setIsEditingPersonal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePersonal}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelPersonal}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Profile Image */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-pink-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{name}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      <Store size={12} />
                      Store Owner
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                      <User size={18} className="text-slate-400" />
                      <span className="text-slate-900">{name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  {isEditingPersonal ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                      <Mail size={18} className="text-slate-400" />
                      <span className="text-slate-900">{email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  {isEditingPersonal ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                      <Phone size={18} className="text-slate-400" />
                      <span className="text-slate-900">{phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Store Info Card */}
            <div className="bg-white rounded-xl border border-pink-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Store className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Store Information</h2>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                      storeStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      storeStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {storeStatus === 'approved' && <CheckCircle size={10} />}
                      {storeStatus === 'pending' && <Clock size={10} />}
                      {storeStatus.charAt(0).toUpperCase() + storeStatus.slice(1)}
                    </span>
                  </div>
                </div>
                {!isEditingStore ? (
                  <button
                    onClick={() => setIsEditingStore(true)}
                    className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveStore}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelStore}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                      <Store size={18} className="text-slate-400" />
                      <span className="text-slate-900">{storeName}</span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Store Username</label>
                  {isEditingStore ? (
                    <input
                      type="text"
                      value={storeUsername}
                      onChange={(e) => setStoreUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400">@</span>
                      <span className="text-slate-900">{storeUsername.replace('@', '')}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  {isEditingStore ? (
                    <textarea
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-slate-50 rounded-lg">
                      <p className="text-slate-900">{storeDescription}</p>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  {isEditingStore ? (
                    <textarea
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                      <MapPin size={18} className="text-slate-400 mt-0.5" />
                      <span className="text-slate-900">{storeAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-xl border border-pink-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Lock className="text-white" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Security</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Business Stats Card */}
            <div className="bg-white rounded-xl border border-pink-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Business Stats</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-pink-600 mb-1">
                    <Package size={16} />
                    <span className="text-sm">Products</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <ShoppingBag size={16} />
                    <span className="text-sm">Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <DollarSign size={16} />
                    <span className="text-sm">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <DollarSign size={16} />
                    <span className="text-sm">Avg Order</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">${stats.avgOrderValue}</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/store/orders')}
                className="w-full mt-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors text-sm font-medium"
              >
                View All Orders →
              </button>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-xl border border-pink-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/store/add-product')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-600 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                >
                  <Package size={18} />
                  <span>Add New Product</span>
                </button>
                <button
                  onClick={() => router.push('/store/inventory')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-600 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                >
                  <Store size={18} />
                  <span>Manage Inventory</span>
                </button>
                <button
                  onClick={() => router.push('/store/wholesale')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-600 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                >
                  <ShoppingBag size={18} />
                  <span>Browse Wholesale</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}
