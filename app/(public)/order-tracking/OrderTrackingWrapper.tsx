'use client'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import OrderTrackingContent from './page'

export default function OrderTrackingWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading order tracking...</span>
                </div>
            </div>
        }>
            <OrderTrackingContent />
        </Suspense>
    )
}
