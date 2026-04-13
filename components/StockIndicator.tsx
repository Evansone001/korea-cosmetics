'use client'

import { AlertCircle, Package, Clock } from 'lucide-react'

interface StockIndicatorProps {
    inStock: boolean
    stockQuantity?: number
    lowStockThreshold?: number
}

const StockIndicator = ({ inStock, stockQuantity = 0, lowStockThreshold = 10 }: StockIndicatorProps) => {
    if (!inStock) {
        return (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <Package size={18} />
                <span className="font-medium">Out of Stock</span>
            </div>
        )
    }

    if (stockQuantity <= lowStockThreshold) {
        return (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                <Clock size={18} />
                <span className="font-medium">Only {stockQuantity} left in stock</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <Package size={18} />
            <span className="font-medium">In Stock ({stockQuantity} available)</span>
        </div>
    )
}

export default StockIndicator
