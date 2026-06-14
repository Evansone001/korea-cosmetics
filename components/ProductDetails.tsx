'use client'

import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { Star, Heart, ShoppingCart, Truck, Award, Tag, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { Product } from "@/types";
import ImageZoom from "./ImageZoom";
import VariantSelector from "./VariantSelector";
import StockIndicator from "./StockIndicator";
import SocialShare from "./SocialShare";
import TrustBadges from "./TrustBadges";
import { toast } from 'react-hot-toast';

interface ProductDetailsProps {
    product: Product;
    type: 'b2b' | 'retail';
}

const ProductDetails = ({ product, type }: ProductDetailsProps) => {
    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES';
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';

    const dispatch = useAppDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images && product.images.length > 0 ? product.images[0] : '');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { cartItems } = useAppSelector(state => state.cart);
    
    // Loading states for industrial UX
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isWishlisting, setIsWishlisting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Auto-save draft functionality
    const [draftSaved, setDraftSaved] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    // Mock variants - in real app, this would come from product data
    const variants = [
        { id: 'small', name: '30ml', price: product.price, inStock: true },
        { id: 'medium', name: '50ml', price: product.price * 1.5, inStock: true },
        { id: 'large', name: '100ml', price: product.price * 2.5, inStock: false },
    ];
    const [selectedVariant, setSelectedVariant] = useState('small');

    // Optimistic addToCart with real-time feedback
    const addToCartHandler = useCallback(async () => {
        if (isAddingToCart) return;
        
        setIsAddingToCart(true);
        setUnsavedChanges(true);
        
        try {
            // Optimistic update - show immediate feedback
            const currentQuantity = cartItems[productId] || 0;
            
            // Show loading state
            toast.loading('Adding to cart...', { id: `cart-${productId}` });
            
            // Dispatch action
            dispatch(addToCart({ productId }));
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Success feedback
            toast.success('Added to cart!', { id: `cart-${productId}` });
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 2000);
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add to cart. Please try again.', { id: `cart-${productId}` });
            // Revert optimistic update if needed
        } finally {
            setIsAddingToCart(false);
            setUnsavedChanges(false);
        }
    }, [productId, cartItems, isAddingToCart, dispatch]);
    
    // Optimistic wishlist toggle
    const toggleWishlist = useCallback(async () => {
        if (isWishlisting) return;
        
        setIsWishlisting(true);
        
        try {
            const newWishlistState = !isWishlisted;
            setIsWishlisted(newWishlistState);
            
            // Show feedback
            toast.loading(newWishlistState ? 'Adding to wishlist...' : 'Removing from wishlist...', { id: `wishlist-${productId}` });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 600));
            
            toast.success(newWishlistState ? 'Added to wishlist!' : 'Removed from wishlist!', { id: `wishlist-${productId}` });
            
            // Auto-save wishlist state
            if (typeof window !== 'undefined') {
                const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                if (newWishlistState) {
                    wishlist.push(productId);
                } else {
                    const index = wishlist.indexOf(productId);
                    if (index > -1) wishlist.splice(index, 1);
                }
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            }
            
        } catch (error) {
            console.error('Wishlist operation failed:', error);
            toast.error('Failed to update wishlist. Please try again.');
            // Revert state on error
            setIsWishlisted(!isWishlisted);
        } finally {
            setIsWishlisting(false);
        }
    }, [isWishlisted, isWishlisting, productId]);

    const rating = product.rating || [];
    const averageRating = rating.length > 0 ? rating.reduce((acc, item) => acc + item.rating, 0) / rating.length : 0;

    const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const selectedVariantData = variants.find(v => v.id === selectedVariant);
    const currentPrice = Number(selectedVariantData?.price || product.price || 0);
    
    // Real-time price updates with variant changes
    useEffect(() => {
        const selectedVariantData = variants.find(v => v.id === selectedVariant);
        const newPrice = Number(selectedVariantData?.price || product.price || 0);
        
        // Show price change notification if different from last price
        if (typeof window !== 'undefined') {
            const lastPrice = parseFloat(localStorage.getItem(`last-price-${productId}`) || '0');
            if (newPrice !== lastPrice && lastPrice > 0) {
                const priceDiff = newPrice - lastPrice;
                if (priceDiff > 0) {
                    toast.success(`Price updated: +${currency}${priceDiff.toFixed(2)}`);
                } else {
                    toast(`Price updated: ${currency}${Math.abs(priceDiff).toFixed(2)}`);
                }
            }
            localStorage.setItem(`last-price-${productId}`, newPrice.toString());
        }
    }, [selectedVariant, productId, currency, product.price]);

    // Auto-save functionality
    useEffect(() => {
        if (unsavedChanges) {
            const timer = setTimeout(() => {
                // Auto-save to localStorage
                if (typeof window !== 'undefined') {
                    const draftData = {
                        productId,
                        selectedVariant,
                        quantity,
                        isWishlisted,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(`product-draft-${productId}`, JSON.stringify(draftData));
                    setDraftSaved(true);
                    setUnsavedChanges(false);
                    setTimeout(() => setDraftSaved(false), 2000);
                }
            }, 2000); // Auto-save after 2 seconds of inactivity
            
            return () => clearTimeout(timer);
        }
    }, [unsavedChanges, productId, selectedVariant, quantity, isWishlisted]);
    
    // Restore draft on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const draft = localStorage.getItem(`product-draft-${productId}`);
            if (draft) {
                try {
                    const draftData = JSON.parse(draft);
                    // Only restore if draft is recent (within 1 hour)
                    if (Date.now() - draftData.timestamp < 3600000) {
                        setSelectedVariant(draftData.selectedVariant);
                        setQuantity(draftData.quantity);
                        setIsWishlisted(draftData.isWishlisted);
                        toast.success('Draft restored!');
                    }
                } catch (error) {
                    console.error('Failed to restore draft:', error);
                }
            }
        }
    }, [productId]);
    
    // Restore wishlist state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                setIsWishlisted(wishlist.includes(productId));
            } catch (error) {
                console.error('Failed to restore wishlist:', error);
                // Reset wishlist state on error
                localStorage.setItem('wishlist', '[]');
                setIsWishlisted(false);
            }
        }
    }, [productId]);
    
    // Error boundary for component recovery
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('ProductDetails component error:', event.error);
            toast.error('Something went wrong. Please refresh the page.');
            
            // Attempt to recover state
            try {
                if (typeof window !== 'undefined') {
                    const draft = localStorage.getItem(`product-draft-${productId}`);
                    if (draft) {
                        const draftData = JSON.parse(draft);
                        setSelectedVariant(draftData.selectedVariant);
                        setQuantity(draftData.quantity);
                        setIsWishlisted(draftData.isWishlisted);
                        toast.success('State recovered from last save.');
                    }
                }
            } catch (recoveryError) {
                console.error('Failed to recover state:', recoveryError);
                toast.error('Please refresh the page to continue.');
            }
        };
        
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, [productId]);

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
                            onClick={() => !cartItems[productId] ? addToCartHandler() : router.push('/cart')}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 text-sm sm:text-base"
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
                        onClick={() => !cartItems[productId] ? addToCartHandler() : router.push('/cart')}
                        disabled={isAddingToCart || !product.inStock}
                        className={`flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                            isAddingToCart || !product.inStock
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                        {isAddingToCart ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={20} />
                                <span>Add to Cart</span>
                            </>
                        )}
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

                {/* Draft Saved Indicator */}
                {draftSaved && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
                        <Check size={16} />
                        <span className="text-sm font-semibold">Draft Saved</span>
                    </div>
                )}

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
