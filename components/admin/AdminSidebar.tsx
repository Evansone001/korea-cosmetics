'use client'

import { usePathname, useRouter } from "next/navigation"
import { HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon, LogOut, Users, ShoppingBag, ChevronLeft, ChevronRight, Plug, Package, Warehouse, Menu, X, Truck, Brain, TrendingUp, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"
import { useState, useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"

const AdminSidebar = () => {

    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
    const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
    const [isMobile, setIsMobile] = useState<boolean>(false)

    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth < 640
            setIsMobile(isMobileDevice)
            // Force close mobile drawer when switching to desktop
            if (!isMobileDevice && isMobileOpen) {
                setIsMobileOpen(false)
            }
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [isMobileOpen])

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Catalog', href: '/admin/catalog', icon: Package },
        { name: 'Warehouse', href: '/admin/warehouse', icon: Warehouse },
        { name: 'Wholesale Orders', href: '/admin/wholesale-orders', icon: Truck },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
        { name: 'Approve', href: '/admin/approve', icon: ShieldCheckIcon },
        { name: 'AI Analytics', href: '/admin/ai-analytics', icon: Brain },
        { name: 'Store Analytics', href: '/admin/store-analytics', icon: TrendingUp },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
        { name: 'CRM', href: '/admin/crm', icon: Plug },
    ]

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    return (
        <>
            {/* Mobile Section - Completely hidden on desktop */}
            <div className="sm:hidden">
                {/* Mobile Menu Button */}
                {isMobile && !isMobileOpen && (
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="sm:hidden fixed top-3 left-4 z-[1001] p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>
                )}

                {/* Mobile Drawer */}
                {isMobile && isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="sm:hidden fixed inset-0 bg-black/50 z-[999]"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        {/* Drawer */}
                        <div className="sm:hidden fixed top-0 left-0 h-full w-72 bg-white z-[1000] shadow-2xl flex flex-col pt-16">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 border-b border-pink-100">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Image 
                                            className="rounded-2xl object-cover ring-4 ring-pink-100 shadow-md w-10 h-10"
                                            src={assets.korea_logo} 
                                            alt="Admin" 
                                            width={40} 
                                            height={40} 
                                        />
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full ring-2 ring-white"></span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">Admin User</p>
                                        <p className="text-xs text-pink-600">Super Admin</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Drawer Navigation */}
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {sidebarLinks.map((link, index) => {
                                    const isActive = pathname === link.href
                                    return (
                                        <Link 
                                            key={index} 
                                            href={link.href} 
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                                ${isActive 
                                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20' 
                                                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                                                }
                                            `}
                                        >
                                            <link.icon size={20} />
                                            <span className="font-medium">{link.name}</span>
                                            {isActive && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Drawer Bottom - Sign Out Only */}
                            <div className="p-4 border-t border-pink-100">
                                <button 
                                    onClick={async () => {
                                        setIsMobileOpen(false)
                                        await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' })
                                        dispatch(logout())
                                        router.push('/login')
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 w-full text-left"
                                >
                                    <LogOut size={20} />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Sidebar */}
            <aside className={`hidden sm:flex h-full flex-col bg-white border-r border-pink-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-20 -right-3 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all z-10"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((link, index) => {
                        const isActive = pathname === link.href
                        return (
                            <Link 
                                key={index} 
                                href={link.href} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group${
                                    isActive 
                                        ? ' bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20' 
                                        : ' text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                                }${
                                    isCollapsed ? ' justify-center px-2' : ''
                                }`}
                                title={isCollapsed ? link.name : ''}
                            >
                                <link.icon 
                                    size={20} 
                                    className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
                                />
                                {!isCollapsed && (
                                    <span className="font-medium whitespace-nowrap">{link.name}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions - Sign Out Only */}
                <div className="p-4 border-t border-pink-100">
                    <button 
                        onClick={async () => {
                            await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' })
                            dispatch(logout())
                            router.push('/login')
                        }}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group w-full text-left
                            ${isCollapsed ? 'justify-center px-2' : ''}
                        `}
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        {!isCollapsed && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}

export default AdminSidebar
