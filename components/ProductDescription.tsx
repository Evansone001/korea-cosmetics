'use client'
import { ArrowRight, StarIcon, ShoppingCart, Heart, Share2, Package, Truck, Shield, RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Product } from "@/types"
import { assets } from "@/assets/assets"

interface ProductDescriptionProps {
    product: Product;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

    // Fetch related products from backend
    useEffect(() => {
        async function fetchRelatedProducts() {
            try {
                const response = await fetch(`/api/products?category=${product.category}&limit=4&exclude=${product.id}`)
                const data = await response.json()
                if (data.products) {
                    setRelatedProducts(data.products)
                }
            } catch (error) {
                console.error('Failed to fetch related products:', error)
            }
        }
        fetchRelatedProducts()
    }, [product.category, product.id])

    const productFeatures = [
        { icon: Package, label: "Authentic Korean Product", desc: "100% genuine from Korea" },
        { icon: Truck, label: "Fast Delivery", desc: "2-4 business days" },
        { icon: Shield, label: "Quality Guaranteed", desc: "Certified authentic" },
        { icon: RotateCcw, label: "Easy Returns", desc: "7-day return policy" }
    ]

    return (
        <div className="space-y-12">
            {/* Product Info & Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    <button 
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-medium ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-300 text-slate-600 hover:border-pink-300 hover:text-pink-600'}`}
                    >
                        <Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} />
                        {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-600 hover:border-pink-300 hover:text-pink-600 transition-all font-medium">
                        <Share2 size={20} />
                        Share
                    </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
                    {productFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                <feature.icon size={20} className="text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{feature.label}</p>
                                <p className="text-xs text-slate-500">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Tabs Section */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    {['Description', 'Reviews', 'Specifications', 'Shipping'].map((tab) => (
                        <button 
                            key={tab}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                tab === selectedTab 
                                    ? 'bg-white text-pink-600 border-b-2 border-pink-500' 
                                    : 'text-slate-600 hover:text-pink-600 hover:bg-slate-100'
                            }`} 
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Description Tab */}
                    {selectedTab === "Description" && (
                        <div className="space-y-8">
                            {/* Overview Section */}
                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-xl font-semibold text-slate-900 mb-4">Overview</h3>
                                <div className="text-slate-600 leading-relaxed space-y-4">
                                    {product.description.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Formula & Texture Section */}
                            {product.formula && (
                                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                            <span className="text-pink-600 text-lg">✦</span>
                                        </span>
                                        Formula & Texture
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed">{product.formula}</p>
                                </div>
                            )}
                            
                            {/* Key Benefits */}
                            {product.keyBenefits && product.keyBenefits.length > 0 && (
                                <div className="bg-pink-50 rounded-xl p-6">
                                    <h4 className="font-semibold text-pink-900 mb-4">Key Benefits</h4>
                                    <ul className="grid md:grid-cols-2 gap-3">
                                        {product.keyBenefits.map((benefit: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3 text-pink-800">
                                                <span className="w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-pink-700 text-xs">✓</span>
                                                </span>
                                                <span className="text-sm">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Key Ingredients */}
                            {product.keyIngredients && Array.isArray(product.keyIngredients) && product.keyIngredients.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-4">Key Ingredients</h4>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {product.keyIngredients.map((ingredient: string, index: number) => (
                                            <div key={index} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
                                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-pink-600 text-xs font-bold">{index + 1}</span>
                                                </div>
                                                <p className="text-sm text-slate-700">{ingredient}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* How to Use */}
                            {product.howToUse && (
                                <div className="bg-blue-50 rounded-xl p-6">
                                    <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-700 text-sm">📋</span>
                                        </span>
                                        How to Use
                                    </h4>
                                    <ol className="space-y-3">
                                        {product.howToUse.split('\n').filter(step => step.trim()).map((step: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-blue-700 text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="text-slate-700">{step.replace(/^\d+\.\s*/, '').trim()}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Product Information Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <h4 className="font-semibold text-slate-900 p-4 bg-slate-50 border-b border-slate-200">
                                    Product Information
                                </h4>
                                <div className="grid md:grid-cols-2">
                                    {product.brand && (
                                        <div className="flex justify-between p-4 border-b border-slate-100 md:border-r">
                                            <span className="text-slate-500">Brand</span>
                                            <span className="font-medium text-slate-900">{product.brand}</span>
                                        </div>
                                    )}
                                    {product.size && (
                                        <div className="flex justify-between p-4 border-b border-slate-100">
                                            <span className="text-slate-500">Size</span>
                                            <span className="font-medium text-slate-900">{product.size}</span>
                                        </div>
                                    )}
                                    {product.skinConcerns && (
                                        <div className="flex justify-between p-4 border-b border-slate-100 md:border-r">
                                            <span className="text-slate-500">Primary Concerns</span>
                                            <span className="font-medium text-slate-900">{product.skinConcerns}</span>
                                        </div>
                                    )}
                                    {product.skinTypes && (
                                        <div className="flex justify-between p-4 border-b border-slate-100">
                                            <span className="text-slate-500">Suitable For</span>
                                            <span className="font-medium text-slate-900">{product.skinTypes}</span>
                                        </div>
                                    )}
                                    {product.texture && (
                                        <div className="flex justify-between p-4 md:border-r">
                                            <span className="text-slate-500">Texture</span>
                                            <span className="font-medium text-slate-900">{product.texture}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between p-4">
                                        <span className="text-slate-500">Country of Origin</span>
                                        <span className="font-medium text-slate-900">South Korea</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {selectedTab === "Reviews" && (
                        <div className="space-y-6">
                            {/* Reviews Summary */}
                            <div className="flex items-center gap-8 pb-6 border-b border-slate-200">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-slate-900">{product.rating?.length > 0 ? (product.rating.reduce((acc, r) => acc + r.rating, 0) / product.rating.length).toFixed(1) : '0.0'}</div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon 
                                                key={star} 
                                                size={16} 
                                                className={star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} 
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{product.rating?.length || 0} reviews</p>
                                </div>
                                <div className="flex-1">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div key={rating} className="flex items-center gap-2 text-sm">
                                            <span className="w-8 text-slate-600">{rating} star</span>
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2}%` }} />
                                            </div>
                                            <span className="w-10 text-slate-500 text-right">{rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Individual Reviews */}
                            <div className="space-y-4">
                                {product.rating?.length > 0 ? product.rating.map((item, index) => (
                                    <div key={index} className="bg-slate-50 rounded-xl p-6">
                                        <div className="flex items-start gap-4">
                                            <Image 
                                                src={item.user.image || "/default-avatar.png"} 
                                                alt={item.user.name} 
                                                className="size-12 rounded-full object-cover" 
                                                width={48} 
                                                height={48} 
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{item.user.name}</p>
                                                        <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon 
                                                                key={star} 
                                                                size={14} 
                                                                className={item.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-700">{item.review}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-500 py-8">No reviews yet. Be the first to review!</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Specifications Tab */}
                    {selectedTab === "Specifications" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Product Specifications</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {product.brand && (
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-500">Brand</span>
                                        <span className="font-medium text-slate-900">{product.brand}</span>
                                    </div>
                                )}
                                {product.size && (
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-500">Size</span>
                                        <span className="font-medium text-slate-900">{product.size}</span>
                                    </div>
                                )}
                                {product.skinTypes && (
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-500">Skin Types</span>
                                        <span className="font-medium text-slate-900">{product.skinTypes}</span>
                                    </div>
                                )}
                                {product.skinConcerns && (
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-500">Skin Concerns</span>
                                        <span className="font-medium text-slate-900">{product.skinConcerns}</span>
                                    </div>
                                )}
                                {product.texture && (
                                    <div className="flex justify-between py-3 border-b border-slate-100">
                                        <span className="text-slate-500">Texture</span>
                                        <span className="font-medium text-slate-900">{product.texture}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500">Country of Origin</span>
                                    <span className="font-medium text-slate-900">South Korea</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Tab */}
                    {selectedTab === "Shipping" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Shipping Information</h3>
                            <div className="bg-blue-50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Truck className="text-blue-600" size={24} />
                                    <h4 className="font-semibold text-blue-900">Delivery Options</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                                        <div>
                                            <p className="font-medium text-blue-900">Standard Delivery</p>
                                            <p className="text-sm text-blue-700">2-4 business days</p>
                                        </div>
                                        <span className="font-semibold text-blue-900">KShs 150</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                                        <div>
                                            <p className="font-medium text-blue-900">Express Delivery</p>
                                            <p className="text-sm text-blue-700">1-2 business days</p>
                                        </div>
                                        <span className="font-semibold text-blue-900">KShs 350</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <div>
                                            <p className="font-medium text-blue-900">B2B Bulk Delivery</p>
                                            <p className="text-sm text-blue-700">3-5 business days</p>
                                        </div>
                                        <span className="font-semibold text-green-600">Free</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">
                                Free shipping on orders over KShs 5,000. We deliver nationwide across Kenya.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Store Info */}
            {product.store && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200">
                    <div className="flex items-center gap-4">
                        <Image 
                            src={product.store.logo || "/default-store.png"} 
                            alt={product.store.name} 
                            className="size-16 rounded-full ring-2 ring-pink-300 object-cover" 
                            width={64} 
                            height={64} 
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-lg">{product.store.name}</p>
                            <p className="text-sm text-slate-600">Official Store • Verified Seller</p>
                        </div>
                        <Link 
                            href={`/shop/${product.store.username}`} 
                            className="flex items-center gap-2 bg-white text-pink-600 px-6 py-3 rounded-xl border border-pink-300 hover:bg-pink-50 transition-colors font-medium"
                        >
                            View Store
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Related Products - BELOW (not beside) */}
            {relatedProducts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">You May Also Like</h3>
                        <Link href="/shop" className="flex items-center gap-1 text-pink-600 hover:text-pink-700 font-medium">
                            View All
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.slice(0, 4).map((item) => (
                            <Link 
                                key={item.id} 
                                href={`/product/${item.id}`}
                                className="group bg-slate-50 rounded-xl p-4 hover:bg-pink-50 transition-colors"
                            >
                                <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center">
                                    <Image 
                                        src={item.images?.[0] || "/placeholder-product.png"} 
                                        alt={item.name}
                                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                                        width={200}
                                        height={200}
                                    />
                                </div>
                                <p className="text-xs text-pink-600 font-medium mb-1">{item.brand}</p>
                                <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-pink-700 transition-colors">{item.name}</h4>
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon 
                                            key={i} 
                                            size={12} 
                                            className={i < Math.floor(item.rating?.length > 0 ? item.rating.reduce((acc, r) => acc + r.rating, 0) / item.rating.length : 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} 
                                        />
                                    ))}
                                    <span className="text-xs text-slate-500">({item.rating?.length > 0 ? (item.rating.reduce((acc, r) => acc + r.rating, 0) / item.rating.length).toFixed(1) : '0.0'})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">KShs {item.price}</span>
                                    {item.mrp && item.mrp > item.price && (
                                        <span className="text-sm text-slate-500 line-through">KShs {item.mrp}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed Section */}
            {relatedProducts.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recently Viewed</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {relatedProducts.slice(0, 3).map((item) => (
                            <Link 
                                key={`recent-${item.id}`} 
                                href={`/product/${item.id}`}
                                className="flex-shrink-0 w-40 bg-white rounded-xl p-3 border border-slate-200 hover:border-pink-300 transition-colors"
                            >
                                <div className="aspect-square bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
                                    <Image 
                                        src={item.images?.[0] || "/placeholder-product.png"} 
                                        alt={item.name}
                                        className="w-full h-full object-contain p-2"
                                        width={150}
                                        height={150}
                                    />
                                </div>
                                <h4 className="text-xs font-medium text-slate-900 line-clamp-2 mb-1">{item.name}</h4>
                                <span className="text-sm font-bold text-pink-600">KShs {item.price}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription
