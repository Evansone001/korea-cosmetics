'use client'

import { Shield, Truck, Package, RotateCcw, Award, Lock } from 'lucide-react'

const TrustBadges = () => {
    const badges = [
        {
            icon: Award,
            title: '100% Authentic',
            description: 'Genuine Korean products',
            color: 'blue'
        },
        {
            icon: Shield,
            title: 'Quality Guaranteed',
            description: 'Certified authentic',
            color: 'green'
        },
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: '2-4 business days',
            color: 'purple'
        },
        {
            icon: Package,
            title: 'Secure Packaging',
            description: 'Damage-free delivery',
            color: 'orange'
        },
        {
            icon: RotateCcw,
            title: 'Easy Returns',
            description: '7-day return policy',
            color: 'pink'
        },
        {
            icon: Lock,
            title: 'Secure Payment',
            description: '100% protected',
            color: 'slate'
        }
    ]

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        pink: 'bg-pink-50 text-pink-600',
        slate: 'bg-slate-50 text-slate-600'
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-pink-50 rounded-2xl border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Why Shop With Us</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {badges.map((badge, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colorClasses[badge.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0`}>
                            <badge.icon size={18} className="sm:hidden" />
                            <badge.icon size={20} className="hidden sm:block" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">{badge.title}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrustBadges
