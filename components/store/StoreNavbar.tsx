'use client'
import Link from "next/link"
import Image from "next/image"
import { assets } from "@/assets/assets"
import { Bell } from "lucide-react"

interface StoreNavbarProps {
  onNotificationsClick?: () => void
  unreadCount?: number
}

const StoreNavbar = ({ onNotificationsClick, unreadCount = 0 }: StoreNavbarProps) => {
  return (
    <div className="flex items-center justify-between px-4 sm:px-12 py-3 border-b border-pink-200 transition-all">
      {/* Spacer for mobile centering */}
      <div className="w-10 sm:hidden"></div>

      {/* Logo - Centered on mobile */}
      <Link href="/" className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none">
        <Image 
          src={assets.korea_logo} 
          alt="Korea Cosmetics Hub"
          width={40}
          height={40}
          className="object-cover rounded-lg"
        />
        <div className="hidden sm:block relative">
          <span className="text-xl font-bold tracking-tight text-slate-800">KoreaCosmetics'</span>
          <span className="absolute -right-10 -top-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm">
            Store
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={onNotificationsClick}
          className="relative p-2 hover:bg-pink-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <p className="hidden sm:block text-sm text-slate-600">Hi, Seller</p>
      </div>
    </div>
  )
}

export default StoreNavbar
