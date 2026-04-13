'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface Variant {
    id: string
    name: string
    price: number
    inStock: boolean
}

interface VariantSelectorProps {
    variants: Variant[]
    selectedVariant: string
    onVariantChange: (variantId: string) => void
}

const VariantSelector = ({ variants, selectedVariant, onVariantChange }: VariantSelectorProps) => {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Size</h3>
            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                    <button
                        key={variant.id}
                        onClick={() => variant.inStock && onVariantChange(variant.id)}
                        disabled={!variant.inStock}
                        className={`
                            relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 font-medium text-sm sm:text-base transition-all
                            ${selectedVariant === variant.id
                                ? 'border-pink-500 bg-pink-50 text-pink-700'
                                : variant.inStock
                                    ? 'border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50/50'
                                    : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <span className="flex items-center gap-2">
                            {variant.name}
                            {selectedVariant === variant.id && (
                                <Check size={14} className="text-pink-600" />
                            )}
                        </span>
                        {!variant.inStock && (
                            <span className="absolute -top-2 -right-2 bg-slate-300 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                Out
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default VariantSelector
