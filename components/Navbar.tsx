'use client'
import { Search, ShoppingCart, User, Menu, X, ChevronDown, MapPin, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { assets } from "@/assets/assets";
import { logout, setUser } from "@/lib/features/auth/authSlice";
import { useCartPath } from "@/hooks/useCartPath";
import { apiClient } from "@/lib/api-client";

const Navbar = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isDeliveryOpen, setIsDeliveryOpen] = useState(false)
    const [resellerStatus, setResellerStatus] = useState<'approved' | 'pending' | 'rejected' | 'none' | null>(null)
    const cartCount = useAppSelector(state => state.cart.total)
    const { user, isAuthenticated, authChecked } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false, isLoading: true, authChecked: false })
    const profileRef = useRef<HTMLDivElement>(null)
    const deliveryRef = useRef<HTMLDivElement>(null)
    const { cartPath } = useCartPath()

    // Restore auth state from server on mount — only if StoreProvider has finished its
    // auth check, user is still not authenticated, AND there is actually an auth-token
    // cookie present (avoids spurious 401 noise on startup for unauthenticated visitors).
    useEffect(() => {
        if (!authChecked || isAuthenticated) return
        const hasToken = typeof document !== 'undefined' &&
            document.cookie.split(';').some(c => c.trim().startsWith('auth-token='))
        if (!hasToken) return

        const restoreAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include'
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data.user) {
                        dispatch(setUser(data.user))
                        console.log('[Navbar] Restored user from /api/auth/me:', data.user.name)
                    }
                }
            } catch (error) {
                console.error('[Navbar] Failed to restore auth:', error)
            }
        }
        restoreAuth()
    }, [authChecked, isAuthenticated, dispatch])

    // Fetch reseller application status
    useEffect(() => {
        const fetchResellerStatus = async () => {
            if (isAuthenticated && (user?.role === 'customer' || user?.role === 'seller')) {
                try {
                    const response: any = await apiClient.getMyResellerApplication()
                    if (response.application) {
                        setResellerStatus(response.application.status)
                    } else {
                        setResellerStatus('none')
                    }
                } catch (error) {
                    setResellerStatus('none')
                }
            } else if (user?.role === 'admin' || user?.role === 'super_admin') {
                setResellerStatus('approved')
            } else {
                setResellerStatus(null)
            }
        }
        fetchResellerStatus()
    }, [isAuthenticated, user])

    // Sample African countries with flags
    const countries = [
        { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
        { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
        { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
        { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
        { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
        { code: 'MA', name: 'Morocco', flag: '��' },
        { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
        { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
        { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
        { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
        { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
        { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
    ]
    
    const [selectedCountry, setSelectedCountry] = useState(countries[3])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (search.trim()) {
            router.push(`/shop?search=${search}`)
        }
    }

    const handleNavigationClick = (e: React.MouseEvent, href: string, isSellerFeature: boolean = false) => {
        if (isSellerFeature && resellerStatus !== 'approved') {
            e.preventDefault()
            if (resellerStatus === 'pending') {
                alert('Your reseller application is pending approval. You can access seller features once approved.')
                router.push('/reseller-application-status')
            } else if (resellerStatus === 'rejected') {
                alert('Your reseller application was rejected. Please submit a new application.')
                router.push('/apply-reseller')
            } else {
                alert('You need to apply for reseller status to access seller features.')
                router.push('/apply-reseller')
            }
        }
    }

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
            if (deliveryRef.current && !deliveryRef.current.contains(event.target as Node)) {
                setIsDeliveryOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const navigation = [
        { name: 'Shop', href: '/shop', isSellerFeature: false },
        { name: 'Stores', href: '/stores', isSellerFeature: false },
        { name: 'B2B Wholesale', href: '/wholesale', isSellerFeature: true },
        { name: 'Manufacturers', href: '/manufacturers', isSellerFeature: false },
        { name: 'About', href: '/about', isSellerFeature: false },
    ]

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="relative w-12 h-12">
                            <Image 
                                src={assets.korea_logo} 
                                alt="Korea Comestics Hub"
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 ml-12">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleNavigationClick(e, item.href, item.isSellerFeature)}
                                className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex items-center flex-1 mx-8">
                        <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                            <input
                                type="text"
                                placeholder="Search Korean cosmetics..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </form>
                    </div>

                    {/* Deliver To Dropdown */}
                    <div className="hidden lg:flex items-center" ref={deliveryRef}>
                        <button
                            onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                            className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg hover:border-blue-400"
                        >
                            <MapPin size={18} />
                            <div className="text-left">
                                <p className="text-xs text-slate-500">Deliver to</p>
                                <p className="text-sm font-medium flex items-center space-x-1">
                                    <span>{selectedCountry.flag}</span>
                                    <span>{selectedCountry.name}</span>
                                </p>
                            </div>
                            <ChevronDown size={16} className={`transform transition-transform ${isDeliveryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDeliveryOpen && (
                            <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-200">
                                    <p className="text-sm font-medium text-slate-900">Choose your location</p>
                                    <p className="text-xs text-slate-500">Select delivery country</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {countries.map((country) => (
                                        <button
                                            key={country.code}
                                            onClick={() => {
                                                setSelectedCountry(country)
                                                setIsDeliveryOpen(false)
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <span className="text-xl">{country.flag}</span>
                                            <div>
                                                <p className="text-sm font-medium">{country.name}</p>
                                                <p className="text-xs text-slate-500">{country.code}</p>
                                            </div>
                                            {selectedCountry.code === country.code && (
                                                <div className="ml-auto">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link href={cartPath} className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors">
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 p-2 text-slate-700 hover:text-blue-600 transition-colors"
                            >
                                {isAuthenticated && user?.image ? (
                                    <Image src={user.image} alt={user.name} width={24} height={24} className="rounded-full" />
                                ) : (
                                    <User size={24} />
                                )}
                                <ChevronDown size={16} className={`transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                                                <p className="text-xs text-slate-500">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/orders"
                                                className="block px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                Orders
                                            </Link>
                                            {user?.role === 'customer' && (
                                                <Link
                                                    href="/apply-reseller"
                                                    className="block px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    Apply as Seller
                                                </Link>
                                            )}
                                            {(user?.role === 'seller' || user?.role === 'admin' || user?.role === 'super_admin' || resellerStatus === 'approved') && (
                                                resellerStatus === 'approved'
                                                    ? <Link
                                                        href="/store"
                                                        className="block px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        Seller Dashboard
                                                    </Link>
                                                    : <span className="block px-4 py-2 text-slate-400 cursor-not-allowed select-none" title="Available once your application is approved">
                                                        Seller Dashboard
                                                    </span>
                                            )}
                                            {(user?.role === 'customer' || user?.role === 'seller') && resellerStatus === 'pending' && (
                                                <Link
                                                    href="/reseller-application-status"
                                                    className="block px-4 py-2 text-yellow-600 hover:bg-yellow-50 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    View Application Status
                                                </Link>
                                            )}
                                            {user?.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <hr className="my-2 border-gray-200" />
                                            <button
                                                className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                onClick={async () => {
                                                    setIsProfileOpen(false)
                                                    // Clear server-side cookie first
                                                    await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' })
                                                    dispatch(logout())
                                                    router.push('/')
                                                }}
                                            >
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                className="flex items-center px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <LogIn size={16} className="mr-2" />
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="flex items-center px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <UserPlus size={16} className="mr-2" />
                                                Create Account
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Left Sidebar Drawer */}
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* Drawer */}
                        <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl md:hidden flex flex-col">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="relative w-10 h-10">
                                        <Image 
                                            src={assets.korea_logo} 
                                            alt="Korea Cosmetics Hub"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                    <span className="ml-2 font-semibold text-slate-800">KoreaCosmetics'</span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Drawer Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto py-4">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearch} className="px-4 mb-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </form>

                                {/* Mobile Navigation */}
                                <nav className="px-2">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={(e) => {
                                                handleNavigationClick(e, item.href, item.isSellerFeature)
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="block px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>

                                {/* Account Section */}
                                <div className="mt-4 pt-4 border-t border-gray-200 px-2">
                                    <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                                    
                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-3 py-2 mb-2">
                                                <p className="font-medium text-slate-800">{user?.name}</p>
                                                <p className="text-sm text-slate-500">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="block px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/orders"
                                                className="block px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Orders
                                            </Link>
                                            {user?.role === 'customer' && (
                                                <Link
                                                    href="/apply-reseller"
                                                    className="block px-3 py-3 text-pink-700 hover:bg-pink-50 rounded-lg transition-colors font-medium"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Apply as Seller
                                                </Link>
                                            )}
                                            {(user?.role === 'seller' || user?.role === 'admin' || user?.role === 'super_admin' || resellerStatus === 'approved') && (
                                                resellerStatus === 'approved'
                                                    ? <Link
                                                        href="/store"
                                                        className="block px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        Seller Dashboard
                                                    </Link>
                                                    : <span className="block px-3 py-3 text-slate-400 cursor-not-allowed select-none rounded-lg" title="Available once your application is approved">
                                                        Seller Dashboard
                                                    </span>
                                            )}
                                            {(user?.role === 'customer' || user?.role === 'seller') && resellerStatus === 'pending' && (
                                                <Link
                                                    href="/reseller-application-status"
                                                    className="block px-3 py-3 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    View Application Status
                                                </Link>
                                            )}
                                            {user?.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                className="block w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                                                onClick={async () => {
                                                    setIsMobileMenuOpen(false)
                                                    await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' })
                                                    dispatch(logout())
                                                    router.push('/')
                                                }}
                                            >
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                className="flex items-center px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <LogIn size={18} className="mr-3" />
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="flex items-center px-3 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <UserPlus size={18} className="mr-3" />
                                                Create Account
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar
