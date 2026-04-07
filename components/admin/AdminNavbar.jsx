'use client'
import Link from "next/link"
import Image from "next/image"
import { Bell, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"
import { assets } from "@/assets/assets"

const AdminNavbar = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        await fetch('/api/auth/login', { method: 'DELETE', credentials: 'include' })
        dispatch(logout())
        router.push('/login')
    }

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-pink-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                {/* Logo - Centered on mobile */}
                <Link href="/" className="flex items-center gap-2 group absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none">
                    <div className="relative w-10 h-10">
                        <Image 
                            src={assets.korea_logo} 
                            alt="Korea Cosmetics Hub"
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div className="hidden sm:block relative">
                        <span className="text-xl font-bold tracking-tight text-slate-800">KoreaBeauty</span>
                        <span className="absolute -right-8 -top-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm">
                            Admin
                        </span>
                    </div>
                </Link>

                {/* Spacer for mobile centering */}
                <div className="w-10 sm:hidden"></div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {/* Logout */}
                    <button 
                        onClick={handleLogout}
                        className="hidden sm:flex p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-pink-200">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-slate-800">Admin User</p>
                            <p className="text-xs text-pink-600">admin@koreacosmetics.com</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AdminNavbar