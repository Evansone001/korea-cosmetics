'use client'
import { useState, useEffect } from 'react'
import PageTitle from "@/components/PageTitle"
import { User, Mail, Phone, MapPin, Edit2, Save, X, Lock, Bell, Shield, Eye, EyeOff } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
    country: string
}

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

    // Account Settings Modals
    const [activeModal, setActiveModal] = useState<'password' | 'email' | 'privacy' | null>(null)
    
    // Change Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    
    // Email Preferences State
    const [emailPreferences, setEmailPreferences] = useState({
        marketing: true,
        orderNotifications: true,
        productUpdates: false,
        newsletter: true
    })
    const [emailLoading, setEmailLoading] = useState(false)
    
    // Privacy Settings State
    const [privacySettings, setPrivacySettings] = useState({
        profileVisible: false,
        activityStatus: true,
        dataSharing: false
    })
    const [privacyLoading, setPrivacyLoading] = useState(false)

    const handleSave = async () => {
        // Save address to backend if address fields are filled
        if (editedProfile.address || editedProfile.city || editedProfile.state) {
            try {
                let token = typeof document !== 'undefined' ? 
                    document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1] : null
                if (!token && typeof localStorage !== 'undefined') {
                    token = localStorage.getItem('auth-token')
                }
                
                if (token) {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
                    const apiPath = baseUrl.endsWith('/api') ? '/addresses' : '/api/addresses';
                    const addressResponse = await fetch(`${baseUrl}${apiPath}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: editedProfile.name,
                            email: editedProfile.email,
                            phone: editedProfile.phone,
                            street: editedProfile.address,
                            city: editedProfile.city,
                            state: editedProfile.state,
                            zip: editedProfile.zip,
                            country: editedProfile.country
                        })
                    })
                    
                    if (addressResponse.ok) {
                        console.log('Address saved successfully')
                    } else {
                        console.error('Failed to save address')
                    }
                }
            } catch (error) {
                console.error('Error saving address:', error)
            }
        }
        
        setProfile(editedProfile)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    // API Call Functions
    const handleChangePassword = async () => {
        setPasswordLoading(true)
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword
                }),
                credentials: 'include'
            })
            
            const data = await response.json()
            
            if (response.ok) {
                alert('Password changed successfully!')
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                setActiveModal(null)
            } else {
                alert(data.error || 'Failed to change password')
            }
        } catch (error) {
            alert('Network error. Please try again.')
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleSaveEmailPreferences = async () => {
        setEmailLoading(true)
        try {
            const response = await fetch('/api/auth/email-preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marketing: emailPreferences.marketing,
                    orderNotifications: emailPreferences.orderNotifications,
                    productUpdates: emailPreferences.productUpdates,
                    newsletter: emailPreferences.newsletter
                }),
                credentials: 'include'
            })
            
            const data = await response.json()
            
            if (response.ok) {
                alert('Email preferences saved successfully!')
                setActiveModal(null)
            } else {
                alert(data.error || 'Failed to save preferences')
            }
        } catch (error) {
            alert('Network error. Please try again.')
        } finally {
            setEmailLoading(false)
        }
    }

    const handleSavePrivacySettings = async () => {
        setPrivacyLoading(true)
        try {
            const response = await fetch('/api/auth/privacy-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileVisible: privacySettings.profileVisible,
                    activityStatus: privacySettings.activityStatus,
                    dataSharing: privacySettings.dataSharing
                }),
                credentials: 'include'
            })
            
            const data = await response.json()
            
            if (response.ok) {
                alert('Privacy settings saved successfully!')
                setActiveModal(null)
            } else {
                alert(data.error || 'Failed to save settings')
            }
        } catch (error) {
            alert('Network error. Please try again.')
        } finally {
            setPrivacyLoading(false)
        }
    }

    // Load user data and preferences on mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true)
                const userData = await apiClient.getCurrentUser()
                
                if (userData) {
                    // Access user data from the correct response structure
                    const userObj = (userData as any).user || userData
                    const firstName = userObj.first_name || ''
                    const lastName = userObj.last_name || ''
                    const name = userObj.name || `${firstName} ${lastName}`.trim() || firstName || ''
                    const email = userObj.email || ''
                    const phone = userObj.phone || ''
                    
                    // Fetch user addresses from backend
                    let addressData = {
                        address: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: ''
                    }
                    
                    try {
                        let token = typeof document !== 'undefined' ?
                            document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1] : null
                        if (!token && typeof localStorage !== 'undefined') {
                            token = localStorage.getItem('auth-token')
                        }

                        if (token) {
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
                            const apiPath = baseUrl.endsWith('/api') ? '/addresses' : '/api/addresses';
                            const addressesResponse = await fetch(`${baseUrl}${apiPath}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            })

                            if (addressesResponse.ok) {
                                const addressesData = await addressesResponse.json()
                                if (addressesData.addresses && addressesData.addresses.length > 0) {
                                    const firstAddress = addressesData.addresses[0]
                                    addressData = {
                                        address: firstAddress.street || '',
                                        city: firstAddress.city || '',
                                        state: firstAddress.state || '',
                                        zip: firstAddress.zip || '',
                                        country: firstAddress.country || ''
                                    }
                                }
                            } else if (addressesResponse.status === 404) {
                                // Handle 404 gracefully - no addresses found
                                console.log('No addresses found for user')
                            }
                        }
                    } catch (addressError) {
                        console.error('Failed to load addresses:', addressError)
                    }
                    
                    setProfile({
                        name,
                        email,
                        phone,
                        ...addressData
                    })
                    setEditedProfile({
                        name,
                        email,
                        phone,
                        ...addressData
                    })
                }
            } catch (err) {
                console.error('Failed to load user data:', err)
                setError('Failed to load profile data')
            } finally {
                setLoading(false)
            }
        }

        const loadPreferences = async () => {
            try {
                // Load email preferences (endpoint may not exist yet, handle gracefully)
                try {
                    const emailResponse = await fetch('/api/auth/email-preferences', {
                        credentials: 'include'
                    })
                    if (emailResponse.ok) {
                        const emailData = await emailResponse.json()
                        setEmailPreferences({
                            marketing: emailData.preferences.marketing,
                            orderNotifications: emailData.preferences.order_notifications,
                            productUpdates: emailData.preferences.product_updates,
                            newsletter: emailData.preferences.newsletter
                        })
                    }
                } catch (emailError) {
                    console.log('Email preferences endpoint not available')
                }
                
                // Load privacy settings (endpoint may not exist yet, handle gracefully)
                try {
                    const privacyResponse = await fetch('/api/auth/privacy-settings', {
                        credentials: 'include'
                    })
                    if (privacyResponse.ok) {
                        const privacyData = await privacyResponse.json()
                        setPrivacySettings({
                            profileVisible: privacyData.settings.profile_visible,
                            activityStatus: privacyData.settings.activity_status,
                            dataSharing: privacyData.settings.data_sharing
                        })
                    }
                } catch (privacyError) {
                    console.log('Privacy settings endpoint not available')
                }
            } catch (error) {
                console.error('Failed to load preferences:', error)
            }
        }
        
        loadUserData()
        loadPreferences()
    }, [])

    if (loading) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-900"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-4xl mx-auto py-8">
                <PageTitle 
                    heading="My Profile" 
                    text="Manage your personal information and preferences" 
                    linkText="Back to Orders" 
                    path="/orders" 
                />

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-1">
                                    <User className="w-4 h-4" />
                                    <span>Full Name</span>
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedProfile.name}
                                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profile.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-1">
                                    <Mail className="w-4 h-4" />
                                    <span>Email Address</span>
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profile.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-1">
                                    <Phone className="w-4 h-4" />
                                    <span>Phone Number</span>
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editedProfile.phone}
                                        onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profile.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Address</span>
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedProfile.address}
                                        onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profile.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">City</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.city}
                                            onChange={(e) => setEditedProfile({...editedProfile, city: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900">{profile.city}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">State</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.state}
                                            onChange={(e) => setEditedProfile({...editedProfile, state: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900">{profile.state}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">ZIP Code</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.zip}
                                            onChange={(e) => setEditedProfile({...editedProfile, zip: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900">{profile.zip}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Country</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.country}
                                            onChange={(e) => setEditedProfile({...editedProfile, country: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-slate-900">{profile.country}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Sections */}
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setActiveModal('password')}
                                className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-pink-300 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-700 font-medium">Change Password</span>
                                    </div>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveModal('email')}
                                className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-pink-300 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <Bell className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-700 font-medium">Email Preferences</span>
                                    </div>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveModal('privacy')}
                                className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-pink-300 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-700 font-medium">Privacy Settings</span>
                                    </div>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.href = '/orders'}
                                className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">View Order History</span>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => window.location.href = '/cart'}
                                className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Shopping Cart</span>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => window.location.href = '/apply-reseller'}
                                className="w-full text-left px-4 py-3 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-pink-700 font-medium">Apply as Seller</span>
                                    <span className="text-pink-400">→</span>
                                </div>
                            </button>
                            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Wishlist</span>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {activeModal === 'password' && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Preferences Modal */}
            {activeModal === 'email' && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Email Preferences</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: 'marketing', label: 'Marketing & Promotions', desc: 'Receive offers and product updates' },
                                { key: 'orderNotifications', label: 'Order Notifications', desc: 'Get updates about your orders' },
                                { key: 'productUpdates', label: 'Product Updates', desc: 'New arrivals and restock alerts' },
                                { key: 'newsletter', label: 'Newsletter', desc: 'Weekly beauty tips and trends' }
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-700">{label}</p>
                                        <p className="text-sm text-slate-500">{desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailPreferences({...emailPreferences, [key]: !emailPreferences[key as keyof typeof emailPreferences]})}
                                        className={`w-12 h-6 rounded-full transition-colors ${emailPreferences[key as keyof typeof emailPreferences] ? 'bg-pink-600' : 'bg-slate-300'}`}
                                    >
                                        <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${emailPreferences[key as keyof typeof emailPreferences] ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEmailPreferences}
                                    disabled={emailLoading}
                                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                                >
                                    {emailLoading ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Settings Modal */}
            {activeModal === 'privacy' && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Privacy Settings</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: 'profileVisible', label: 'Public Profile', desc: 'Make your profile visible to other users' },
                                { key: 'activityStatus', label: 'Activity Status', desc: 'Show when you\'re active' },
                                { key: 'dataSharing', label: 'Data Sharing', desc: 'Share usage data for improvements' }
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-700">{label}</p>
                                        <p className="text-sm text-slate-500">{desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPrivacySettings({...privacySettings, [key]: !privacySettings[key as keyof typeof privacySettings]})}
                                        className={`w-12 h-6 rounded-full transition-colors ${privacySettings[key as keyof typeof privacySettings] ? 'bg-pink-600' : 'bg-slate-300'}`}
                                    >
                                        <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${privacySettings[key as keyof typeof privacySettings] ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-slate-200">
                                <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors mb-2">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-red-600" />
                                        <span className="text-red-700 font-medium">Download My Data</span>
                                    </div>
                                </button>
                                <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-red-600" />
                                        <span className="text-red-700 font-medium">Delete Account</span>
                                    </div>
                                </button>
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePrivacySettings}
                                    disabled={privacyLoading}
                                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                                >
                                    {privacyLoading ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
