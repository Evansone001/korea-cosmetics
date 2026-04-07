'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ShoppingCartIcon, StarIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/hooks'
import { addToCart } from '@/lib/features/cart/cartSlice'

const Hero = () => {
    const currency = "KShs"
    const dispatch = useAppDispatch()

    const addToCartHandler = (productId: string) => {
        dispatch(addToCart({ productId }))
    }

    const featuredProducts = [
        {
            id: "prod_1",
            name: "[COSRX] Advanced Snail 96 Mucin Power Essence",
            price: 3500,
            originalPrice: 4500,
            image: assets.essence,
            rating: 4.9,
            badge: "Best Seller",
            wholesalePrice: 1999,
            minOrder: 10,
            description: "Lightweight essence with 96% snail mucin extract for intense hydration and skin repair. Perfect for dry and sensitive skin types.",
            keyBenefits: [
                "🐌 96% snail mucin for powerful skin repair",
                "💧 Intense hydration and moisture retention",
                "✨ Improves skin elasticity and texture",
                "🌟 Helps fade dark spots and acne scars"
            ],
            skinConcerns: "Dryness, Scars, Texture, Aging",
            skinTypes: "All skin types",
            texture: "Lightweight essence",
            keyIngredients: "Snail Secretion Filtrate (96%), Niacinamide",
            brand: "COSRX",
            size: "100 ml"
        },
        {
            id: "prod_2", 
            name: "Korean Beauty Model Anna Collection",
            price: 9500,
            originalPrice: 12000,
            image: assets.anna_keibalo,
            rating: 4.8,
            badge: "Exclusive",
            wholesalePrice: 5500,
            minOrder: 5,
            description: "Premium Korean cosmetics set featuring Anna Keibalo's favorite products for flawless skin. Complete routine for glass skin effect.",
            keyBenefits: [
                "� Model curated collection",
                "✨ Complete glass skin routine",
                "💎 Premium quality products", 
                "🌟 Visible results in 30 days"
            ],
            skinConcerns: "Overall skin health, Radiance",
            skinTypes: "All skin types",
            texture: "Various textures",
            keyIngredients: "Premium Korean botanicals",
            brand: "KoreaBeauty Hub",
            size: "Full set"
        },
        {
            id: "prod_3",
            name: "Elena Soroka K-Beauty Essentials",
            price: 6800,
            originalPrice: 8500,
            image: assets.elena_soroka,
            rating: 4.7,
            badge: "Popular",
            wholesalePrice: 3999,
            minOrder: 8,
            description: "Curated collection by Elena Soroka featuring must-have Korean beauty products for natural, glowing skin.",
            keyBenefits: [
                "� Natural glow enhancement",
                "� Model approved selection",
                "� Deep hydration focus",
                "🌸 Gentle yet effective"
            ],
            skinConcerns: "Natural radiance, Hydration",
            skinTypes: "Normal, Combination, Dry",
            texture: "Various textures",
            keyIngredients: "Natural Korean extracts",
            brand: "KoreaBeauty Hub",
            size: "Essential set"
        }
    ]

    const categories = [
        { name: "Skincare", icon: "🧴", color: "bg-pink-100" },
        { name: "Makeup", icon: "💄", color: "bg-rose-100" },
        { name: "Hair Care", icon: "👱‍♀️", color: "bg-purple-100" },
        { name: "Body Care", icon: "🛁", color: "bg-blue-100" }
    ]

    return (
        <div className='min-h-screen'>
            {/* Hero Section */}
            <div className='relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden'>
                <div className='max-w-7xl mx-auto px-6 py-20'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        {/* Left Content */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                
                                <h1 className='text-5xl lg:text-6xl font-bold text-slate-900 leading-tight'>
                                    Premium Korean
                                    <span className='text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500'> Cosmetics Hub</span>
                                </h1>
                                <p className='text-xl text-slate-600 max-w-lg'>
                                    Your trusted gateway to authentic Korean cosmetics. Partner with leading manufacturers 
                                    for wholesale and retail opportunities. Based in Kenya, serving Africa.
                                </p>
                            </div>
                            
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <Link href="/shop" className='inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors font-medium'>
                                    <ShoppingCartIcon size={20} />
                                    Shop Products
                                    <ArrowRightIcon size={20} />
                                </Link>
                                <Link href="/wholesale" className='inline-flex items-center gap-2 border border-pink-300 text-pink-700 px-8 py-4 rounded-lg hover:bg-pink-50 transition-colors font-medium'>
                                    B2B Wholesale
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className='grid grid-cols-3 gap-8 pt-8 border-t border-slate-200'>
                                <div>
                                    <div className='text-3xl font-bold text-slate-900'>50+</div>
                                    <div className='text-sm text-slate-600'>Korean Brands</div>
                                </div>
                                <div>
                                    <div className='text-3xl font-bold text-slate-900'>1000+</div>
                                    <div className='text-sm text-slate-600'>Products</div>
                                </div>
                                <div>
                                    <div className='text-3xl font-bold text-slate-900'>B2B</div>
                                    <div className='text-sm text-slate-600'>Focus</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-tr from-pink-100 to-rose-100 rounded-3xl transform rotate-3'></div>
                            <div className='relative bg-white rounded-3xl p-8 shadow-xl'>
                                <div className='aspect-square bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl flex items-center justify-center overflow-hidden'>
                                    <Image 
                                        src={assets.essence}
                                        alt="Premium Korean Cosmetics"
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className='max-w-7xl mx-auto px-6 py-16'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl font-bold text-slate-900 mb-4'>Featured Korean Cosmetics</h2>
                    <p className='text-slate-600 max-w-2xl mx-auto'>
                        Premium Korean skincare and beauty products with exclusive B2B wholesale pricing
                    </p>
                </div>

                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {featuredProducts.map((product) => (
                        <Link key={product.id} href={`/product/${product.id}`} className='group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden block'>
                            <div className='relative'>
                                <div className='absolute top-4 left-4 z-10'>
                                    <span className='bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-medium'>
                                        {product.badge}
                                    </span>
                                </div>
                                <div className='aspect-square bg-gradient-to-br from-pink-50 to-rose-50 p-8 flex items-center justify-center'>
                                    <Image 
                                        src={product.image} 
                                        alt={product.name}
                                        className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-300'
                                    />
                                </div>
                            </div>
                            <div className='p-6'>
                                <div className='mb-3'>
                                    <span className='text-xs text-pink-600 font-medium'>{product.brand}</span>
                                    <h3 className='text-sm font-semibold text-slate-900 mt-1 line-clamp-2'>{product.name}</h3>
                                </div>
                                
                                <div className='flex items-center gap-1 mb-3'>
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon 
                                            key={i} 
                                            size={16} 
                                            className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                                        />
                                    ))}
                                    <span className='text-sm text-slate-600 ml-1'>({product.rating})</span>
                                </div>

                                <p className='text-xs text-slate-600 mb-3 line-clamp-2'>{product.description}</p>

                                <div className='text-xs text-slate-500 mb-3 space-y-1'>
                                    <div><span className='font-medium'>Skin Types:</span> {product.skinTypes}</div>
                                    <div><span className='font-medium'>Key Ingredients:</span> {product.keyIngredients}</div>
                                </div>

                                <div className='space-y-2 mb-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <span className='text-sm text-slate-500'>Retail:</span>
                                            <span className='text-lg font-bold text-slate-900 ml-1'>{currency}{product.price}</span>
                                            <span className='text-sm text-slate-500 line-through ml-1'>{currency}{product.originalPrice}</span>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between bg-pink-50 rounded-lg p-2'>
                                        <div>
                                            <span className='text-sm text-pink-600 font-medium'>B2B Price:</span>
                                            <span className='text-lg font-bold text-pink-700 ml-1'>{currency}{product.wholesalePrice}</span>
                                        </div>
                                        <span className='text-xs text-pink-600'>Min: {product.minOrder}pcs</span>
                                    </div>
                                </div>

                                <div className='flex gap-2'>
                                    <button onClick={() => window.location.href = `/product/${product.id}?type=retail`} className='flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors text-sm font-medium'>
                                        Buy Retail
                                    </button>
                                    <button onClick={() => window.location.href = `/product/${product.id}?type=b2b`} className='flex-1 border border-pink-300 text-pink-700 py-2 rounded-lg hover:bg-pink-50 transition-colors text-sm font-medium'>
                                        B2B Order
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Categories - Continuous Carousel */}
            <div className='bg-gradient-to-br from-pink-50 to-rose-50 py-16 overflow-hidden'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-slate-900 mb-4'>Shop by Category</h2>
                        <p className='text-slate-600'>Premium Korean beauty categories for retail and wholesale</p>
                    </div>
                </div>
                
                {/* Continuous Scrolling Carousel */}
                <div className='relative w-full overflow-hidden'>
                    <div className='flex animate-marquee whitespace-nowrap'>
                        {/* First set of categories */}
                        {categories.map((category, index) => (
                            <div key={`first-${index}`} className={`${category.color} rounded-2xl p-8 mx-4 min-w-[200px] text-center hover:scale-105 transition-transform cursor-pointer inline-block`}>
                                <div className='text-4xl mb-4'>{category.icon}</div>
                                <h3 className='font-semibold text-slate-900 whitespace-normal'>{category.name}</h3>
                            </div>
                        ))}
                        {/* Duplicate set for seamless loop */}
                        {categories.map((category, index) => (
                            <div key={`second-${index}`} className={`${category.color} rounded-2xl p-8 mx-4 min-w-[200px] text-center hover:scale-105 transition-transform cursor-pointer inline-block`}>
                                <div className='text-4xl mb-4'>{category.icon}</div>
                                <h3 className='font-semibold text-slate-900 whitespace-normal'>{category.name}</h3>
                            </div>
                        ))}
                        {/* Third set for extra smoothness */}
                        {categories.map((category, index) => (
                            <div key={`third-${index}`} className={`${category.color} rounded-2xl p-8 mx-4 min-w-[200px] text-center hover:scale-105 transition-transform cursor-pointer inline-block`}>
                                <div className='text-4xl mb-4'>{category.icon}</div>
                                <h3 className='font-semibold text-slate-900 whitespace-normal'>{category.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Korean Manufacturers Section */}
            <div className='py-16 bg-white'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-slate-900 mb-4'>Trusted Korean Manufacturers</h2>
                        <p className='text-slate-600 max-w-2xl mx-auto'>
                            Partner with leading Korean cosmetics manufacturers for authentic, high-quality products
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {[
                            { name: 'Seoul Beauty Labs', specialty: 'Skincare Innovation', cert: 'GMP Certified' },
                            { name: 'Korea Cosmetics Co.', specialty: 'Makeup & Color', cert: 'ISO 9001' },
                            { name: 'Busan Beauty Tech', specialty: 'Hair Care Solutions', cert: 'KFDA Approved' },
                            { name: 'Incheon Skincare', specialty: 'Anti-Aging', cert: 'Organic Certified' },
                            { name: 'Daegu Beauty Labs', specialty: 'Natural Products', cert: 'Vegan Certified' },
                            { name: 'Suwon Cosmetics', specialty: 'Medical Beauty', cert: 'Dermatologist Tested' }
                        ].map((manufacturer, index) => (
                            <div key={index} className='bg-white border border-pink-200 rounded-2xl p-6 hover:shadow-lg transition-shadow'>
                                <div className='flex items-center justify-between mb-4'>
                                    <div className='w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold'>
                                        {manufacturer.name.charAt(0)}
                                    </div>
                                    <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium'>
                                        {manufacturer.cert}
                                    </span>
                                </div>
                                <h3 className='text-lg font-semibold text-slate-900 mb-2'>{manufacturer.name}</h3>
                                <p className='text-sm text-slate-600 mb-4'>{manufacturer.specialty}</p>
                                <button className='text-pink-600 hover:text-pink-700 text-sm font-medium'>
                                    View Products →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
