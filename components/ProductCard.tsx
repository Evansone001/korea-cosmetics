'use client'
import { StarIcon, ShoppingBagIcon, Store as StoreIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import ProductRegulatory from './product/RegulatoryCompliance'

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KShs'

    // calculate the average rating of the product
    const rating = product.rating || [];
    const avgRating = rating.length > 0
        ? Math.round(rating.reduce((acc: number, curr: any) => acc + curr.rating, 0) / rating.length * 10) / 10
        : 0;

    // Generate badge based on product properties
    const getBadge = () => {
        if (rating.length > 50) return { text: 'Best Seller', class: 'from-pink-500 to-rose-500' };
        if (product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return { text: 'New Arrival', class: 'from-purple-500 to-indigo-500' };
        if (product.mrp && product.price < product.mrp * 0.7) return { text: 'Hot Deal', class: 'from-orange-500 to-red-500' };
        return null;
    };

    const badge = getBadge();

    // Calculate savings percentage
    const savingsPercent = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    return (
        <div className='group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full'>
            {/* Image Section */}
            <Link href={`/product/${product.id}`} className='relative block'>
                {badge && (
                    <div className='absolute top-3 left-3 z-10 flex flex-col gap-2'>
                        <span className={`bg-gradient-to-r ${badge.class} text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm`}>
                            {badge.text}
                        </span>
                        {savingsPercent > 0 && (
                            <span className='bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium'>
                                -{savingsPercent}%
                            </span>
                        )}
                    </div>
                )}
                <div className='aspect-square bg-gradient-to-br from-pink-50 to-rose-50 p-6 flex items-center justify-center overflow-hidden'>
                    {product.images && product.images.length > 0 ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={400}
                            height={400}
                            className='w-full h-full object-contain group-hover:scale-110 transition-transform duration-500'
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span className="text-4xl">📦</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <div className='p-5 flex flex-col flex-1'>
                {/* Brand & Category */}
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-xs text-pink-600 font-medium uppercase tracking-wider'>
                        {product.brand || product.category}
                    </span>
                    <span className='text-xs text-slate-400'>{product.size || 'Standard'}</span>
                </div>

                {/* Store Information */}
                {(product as any).store && (
                    <Link href={`/stores/${(product as any).store.id}`} className='flex items-center gap-1 mb-2 hover:text-pink-600 transition-colors'>
                        <StoreIcon size={12} className='text-slate-400' />
                        <span className='text-xs text-slate-600 truncate'>{(product as any).store.name}</span>
                    </Link>
                )}

                {/* Product Name */}
                <Link href={`/product/${product.id}`}>
                    <h3 className='text-sm font-semibold text-slate-900 line-clamp-2 hover:text-pink-600 transition-colors mb-2'>
                        {product.name}
                    </h3>
                </Link>

                {/* Regulatory Compliance (Compact) */}
                {(product as any).regulatory && (
                    <ProductRegulatory 
                        regulatory={(product as any).regulatory} 
                        compact={true} 
                    />
                )}

                {/* Rating */}
                <div className='flex items-center gap-1 mb-3'>
                    <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                size={14}
                                className={i < Math.floor(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                            />
                        ))}
                    </div>
                    <span className='text-xs text-slate-500'>({rating.length})</span>
                    <span className='text-xs font-medium text-slate-700 ml-1'>{avgRating > 0 ? avgRating.toFixed(1) : '0.0'}</span>
                </div>

                {/* Description (if available) */}
                {product.description && (
                    <p className='text-xs text-slate-500 mb-3 line-clamp-2 flex-1'>
                        {product.description}
                    </p>
                )}

                {/* Skin Types (if available) */}
                {product.skinTypes && (
                    <div className='text-xs text-slate-400 mb-1'>
                        <span className='font-medium text-slate-500'>Skin Type:</span> {product.skinTypes}
                    </div>
                )}

                {/* Key Ingredients (if available) */}
                {product.keyIngredients && (
                    <div className='text-xs text-slate-400 mb-3'>
                        <span className='font-medium text-slate-500'>Key Ingredients:</span> {Array.isArray(product.keyIngredients) ? product.keyIngredients.slice(0, 2).join(', ') : product.keyIngredients}
                    </div>
                )}

                {/* Pricing Section */}
                <div className='space-y-2 mb-4'>
                    {/* Retail Price */}
                    <div className='flex items-center justify-between'>
                        <span className='text-xs text-slate-500'>Retail:</span>
                        <div className='flex items-center gap-2'>
                            <span className='text-lg font-bold text-slate-900'>{currency}{product.price.toLocaleString()}</span>
                            {product.mrp > product.price && (
                                <span className='text-sm text-slate-400 line-through'>{currency}{product.mrp.toLocaleString()}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 mt-auto'>
                    <Link
                        href={`/product/${product.id}`}
                        className='flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all text-xs font-semibold text-center flex items-center justify-center gap-1 shadow-sm hover:shadow-md'
                    >
                        <ShoppingBagIcon size={14} />
                        Buy
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
