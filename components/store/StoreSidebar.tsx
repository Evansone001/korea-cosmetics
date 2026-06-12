'use client'
import { usePathname, useRouter } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, Store, ChevronLeft, ChevronRight, Package, ShoppingBag, Warehouse, Menu, X, LogOut, User, LucideIcon, ClipboardList } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"
import { apiClient } from "@/lib/api-client"

interface SidebarLink {
  name: string
  href: string
  icon: LucideIcon
}

interface StoreInfo {
  id: string
  name: string
  username: string
  logo: string | null
}

interface StoreSidebarProps {
  storeInfo: StoreInfo | null
}

const StoreSidebar = ({ storeInfo }: StoreSidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false, isLoading: true })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [resellerStatus, setResellerStatus] = useState<'approved' | 'pending' | 'rejected' | 'none' | null>(null)

  const sidebarLinks: SidebarLink[] = [
    { name: 'Dashboard', href: '/store', icon: HomeIcon },
    { name: 'Wholesale', href: '/store/wholesale', icon: ShoppingBag },
    { name: 'Warehouse Purchases', href: '/store/wholesale/orders', icon: ClipboardList },
    { name: 'Inventory', href: '/store/inventory', icon: Warehouse },
    { name: 'Catalog', href: '/store/catalog', icon: Package },
    { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
    { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Fetch reseller application status
  useEffect(() => {
    const fetchResellerStatus = async () => {
      if (isAuthenticated && user?.role === 'customer') {
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
      } else if (user?.role === 'seller' || user?.role === 'admin') {
        setResellerStatus('approved')
      } else {
        setResellerStatus(null)
      }
    }
    fetchResellerStatus()
  }, [isAuthenticated, user])

  const handleNavigationClick = (e: React.MouseEvent, href: string) => {
    if (resellerStatus !== 'approved') {
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

  return (
    <>
      {/* Mobile Menu Button - Top of navbar - Hidden when drawer is open */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="sm:hidden fixed top-3 left-4 z-[1001] p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden sm:flex h-full flex-col border-r border-pink-100 bg-white transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'min-w-60'}`}>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-20 -right-3 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation */}
        <div className="mt-6 flex-1">
          {
            sidebarLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={(e) => handleNavigationClick(e, link.href)}
                className={`relative flex items-center gap-3 text-slate-600 hover:bg-pink-50 hover:text-pink-600 p-2.5 transition ${pathname === link.href && 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'} ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? link.name : ''}
              >
                <link.icon size={18} className={`${isCollapsed ? '' : 'sm:ml-5'}`} />
                {!isCollapsed && <p>{link.name}</p>}
                {pathname === link.href && <span className="absolute bg-white right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
              </Link>
            ))
          }
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-pink-100 space-y-1">
          <Link 
            href="/store/profile"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all duration-200 group w-full text-left
              ${isCollapsed ? 'justify-center px-2' : ''}
              ${pathname === '/store/profile' ? 'bg-pink-50 text-pink-600' : ''}
            `}
            title={isCollapsed ? 'Profile' : ''}
          >
            <User size={20} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="font-medium">Profile</span>}
          </Link>
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
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[999] sm:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-[1000] shadow-2xl sm:!hidden flex flex-col pt-16">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-100">
              <div className="flex items-center gap-3">
                {storeInfo?.logo ? (
                  <Image 
                    className="rounded-full shadow-md w-10 h-10 ring-4 ring-pink-100" 
                    src={storeInfo.logo} 
                    alt={storeInfo?.name || 'Store'} 
                    width={40} 
                    height={40} 
                  />
                ) : (
                  <div className="rounded-full shadow-md bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center w-10 h-10">
                    <span className="text-pink-600 font-bold text-lg">{storeInfo?.name?.charAt(0) || 'S'}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{storeInfo?.name || 'Store'}</p>
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
                    onClick={(e) => {
                      handleNavigationClick(e, link.href)
                      setIsMobileOpen(false)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'}`}
                  >
                    <link.icon size={20} />
                    <span className="font-medium">{link.name}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </Link>
                )
              })}
            </nav>

            {/* Drawer Sign Out */}
            <div className="p-4 border-t border-pink-100 space-y-1">
              <Link 
                href="/store/profile"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${pathname === '/store/profile' ? 'bg-pink-50 text-pink-600' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'}`}
              >
                <User size={20} />
                <span className="font-medium">Profile</span>
              </Link>
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
    </>
  )
}

export default StoreSidebar
