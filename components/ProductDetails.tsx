'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { Star, Heart, ShoppingCart, Truck, Award, Tag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { Product } from "@/types";
import ImageZoom from "./ImageZoom";
import VariantSelector from "./VariantSelector";
import StockIndicator from "./StockIndicator";
import SocialShare from "./SocialShare";
import TrustBadges from "./TrustBadges";

interface ProductDetailsProps {
    product: Product;
    type: 'b2b' | 'retail';
}

const ProductDetails = ({ product, type }: ProductDetailsProps) => {
    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';

    const cart = useAppSelector(state => state.cart.cartItems);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images && product.images.length > 0 ? product.images[0] : '');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { cartItems } = useAppSelector(state => state.cart);

    // Mock variants - in real app, this would come from product data
    const variants = [
        { id: 'small', name: '30ml', price: product.price, inStock: true },
        { id: 'medium', name: '50ml', price: product.price * 1.5, inStock: true },
        { id: 'large', name: '100ml', price: product.price * 2.5, inStock: false },
    ];
    const [selectedVariant, setSelectedVariant] = useState('small');

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
        // Cart sync to backend is handled by cart slice
    }

    const rating = product.rating || [];
    const averageRating = rating.length > 0 ? rating.reduce((acc, item) => acc + item.rating, 0) / rating.length : 0;

    const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const selectedVariantData = variants.find(v => v.id === selectedVariant);
    const currentPrice = Number(selectedVariantData?.price || product.price || 0);

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 w-full">
            {/* Image Gallery */}
            <div className="lg:w-1/2 w-full">
                <div className="sticky top-4 lg:top-6">
                    {/* Main Image with Zoom */}
                    <div className="mb-4">
                        {mainImage ? (
                            <ImageZoom src={mainImage} alt={product.name} />
                        ) : (
                            <div className="flex items-center justify-center h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                <span className="text-6xl sm:text-7xl md:text-8xl">📦</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className={`
                                        flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden transition-all
                                        ${mainImage === image
                                            ? 'border-pink-500 ring-2 ring-pink-200'
                                            : 'border-slate-200 hover:border-pink-300'
                                        }
                                    `}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 space-y-4 lg:space-y-6 w-full min-w-0">
                {/* Brand */}
                {product.brand && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-pink-600 uppercase tracking-wider">{product.brand}</span>
                        <Award size={16} className="text-pink-500" />
                    </div>
                )}

                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={18}
                                className={star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-slate-500">{rating.length} reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900">{currency}{currentPrice.toFixed(2)}</span>
                    {product.mrp > product.price && (
                        <>
                            <span className="text-lg sm:text-xl text-slate-400 line-through">{currency}{product.mrp.toFixed(2)}</span>
                            <span className="bg-pink-100 text-pink-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                                -{discount}%
                            </span>
                        </>
                    )}
                </div>

                {/* Stock Indicator */}
                <StockIndicator inStock={product.inStock ?? true} stockQuantity={product.inStock ? 100 : 0} />

                {/* Product Badges */}
                <div className="flex flex-wrap gap-2">
                    {product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                            <Sparkles size={12} />
                            New Arrival
                        </span>
                    )}
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                        <Award size={12} />
                        Authentic Korean
                    </span>
                </div>

                {/* Variant Selector */}
                <VariantSelector
                    variants={variants}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                />

                {/* Quantity & Add to Cart */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-sm font-semibold text-slate-700">Quantity</span>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-pink-300 transition-colors font-semibold text-slate-700"
                            >
                                -
                            </button>
                            <span className="w-10 sm:w-12 text-center font-semibold text-slate-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-pink-300 transition-colors font-semibold text-slate-700"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <ShoppingCart size={20} />
                            {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                        </button>
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                                isWishlisted
                                    ? 'border-red-500 bg-red-50 text-red-500'
                                    : 'border-slate-200 text-slate-400 hover:border-pink-300 hover:text-pink-500'
                            }`}
                        >
                            <Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} />
                        </button>
                    </div>

                    <button className="w-full bg-slate-900 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all text-sm sm:text-base">
                        Buy Now
                    </button>
                </div>

                {/* Social Share */}
                <div className="flex items-center gap-3">
                    <SocialShare
                        productUrl={productUrl}
                        productName={product.name}
                        productImage={typeof mainImage === 'string' ? mainImage : mainImage.src}
                    />
                </div>

                {/* Trust Badges */}
                <TrustBadges />

                {/* Delivery Info */}
                <div className="flex items-center gap-3 text-slate-600 bg-blue-50 p-3 sm:p-4 rounded-xl">
                    <Truck className="text-blue-600 shrink-0" size={20} />
                    <div>
                        <p className="font-semibold text-xs sm:text-sm">Free delivery on orders over {currency}5,000</p>
                        <p className="text-xs text-slate-500">Estimated delivery: 2-4 business days</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
