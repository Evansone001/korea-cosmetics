'use client'
import { useState } from 'react'
import PageTitle from "@/components/PageTitle"
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'

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
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+254 712 345 678',
        address: '123 Main Street',
        city: 'Nairobi',
        state: 'Nairobi County',
        zip: '00100',
        country: 'Kenya'
    })

    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

    const handleSave = () => {
        setProfile(editedProfile)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
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
                            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Change Password</span>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Email Preferences</span>
                                    <span className="text-slate-400">→</span>
                                </div>
                            </button>
                            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Privacy Settings</span>
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
        </div>
    )
}
