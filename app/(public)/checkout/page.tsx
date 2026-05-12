'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { CreditCard, Truck, MapPin, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { CartItem, Address, Product } from '@/types';
import { apiClient } from '@/lib/api-client';

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { cartItems } = useAppSelector(state => state.cart);
    const { user, isAuthenticated, isLoading: authLoading } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false, isLoading: true });

    const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cartArray, setCartArray] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                console.log('[Checkout] User not authenticated, redirecting to login');
                router.push('/login?redirect=/checkout');
            } else {
                console.log('[Checkout] User authenticated, proceeding to checkout');
                setIsCheckingAuth(false);
            }
        }
    }, [isAuthenticated, authLoading, router]);

    // Shipping form state
    const [shippingAddress, setShippingAddress] = useState<Partial<Address>>({
        name: user?.name || '',
        email: user?.email || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'Kenya',
        phone: ''
    });

    // Update shipping address when user data is loaded
    useEffect(() => {
        if (user?.email && !shippingAddress.email) {
            setShippingAddress(prev => ({ ...prev, email: user.email }));
        }
    }, [user?.email]);

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa' | 'cod'>('mpesa');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const shipping = totalPrice > 500 ? 0 : 50;
    const finalTotal = totalPrice + shipping - discount;

    useEffect(() => {
        const fetchCartProducts = async () => {
            if (cartItems && Object.keys(cartItems).length > 0) {
                const newCartArray: CartItem[] = [];
                let price = 0;
                
                for (const [key, value] of Object.entries(cartItems)) {
                    try {
                        const response = await apiClient.getProduct(key);
                        const product = response?.product as Product;
                        if (product) {
                            newCartArray.push({ product, quantity: value });
                            price += product.price * value;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch product ${key}:`, error);
                    }
                }
                
                setCartArray(newCartArray);
                setTotalPrice(price);
            }
            setIsLoading(false);
        };
        
        fetchCartProducts();
    }, [cartItems]);

    useEffect(() => {
        if (!isLoading && cartArray.length === 0 && Object.keys(cartItems).length > 0) {
            router.push('/cart');
        }
    }, [cartArray, cartItems, router, isLoading]);

    // Show loading state while checking authentication
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === 'beauty10') {
            setDiscount(totalPrice * 0.1);
            toast.success('10% discount applied!');
        } else {
            toast.error('Invalid promo code');
        }
    };

    const isShippingValid = shippingAddress.name && shippingAddress.email && 
                            shippingAddress.street && shippingAddress.city && 
                            shippingAddress.state && shippingAddress.zip && shippingAddress.phone;

    // Log shipping address for debugging
    console.log('[Checkout] Shipping address:', shippingAddress);
    console.log('[Checkout] User email:', user?.email);

    const handlePlaceOrder = async () => {
        // Validate shipping address before placing order
        if (!isShippingValid) {
            toast.error('Please complete all shipping information fields');
            return;
        }

        setIsProcessing(true);
        
        try {
            // Get JWT token
            let token: string | null = null;
            if (typeof document !== 'undefined') {
                const cookies = document.cookie.split(';');
                const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
                if (authCookie) {
                    token = authCookie.split('=')[1];
                }
            }
            
            if (!token && typeof localStorage !== 'undefined') {
                token = localStorage.getItem('auth-token');
            }
            
            // Prepare order items
            const orderItems = cartArray.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            }));
            
            // Prepare headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Call backend API to create order
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
            const apiPath = baseUrl.endsWith('/api') ? '/orders/create' : '/api/orders/create';
            const response = await fetch(`${baseUrl}${apiPath}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    items: orderItems,
                    shipping_address: shippingAddress,
                    payment_method: paymentMethod
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to place order');
            }
            
            toast.success('Order placed successfully!');
            router.push('/orders');
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to place order');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <Link href="/cart" className="hover:text-pink-600">Cart</Link>
                        <ChevronRight size={16} />
                        <span className={step === 'shipping' ? 'text-pink-600 font-medium' : ''}>Shipping</span>
                        <ChevronRight size={16} />
                        <span className={step === 'payment' ? 'text-pink-600 font-medium' : ''}>Payment</span>
                        <ChevronRight size={16} />
                        <span className={step === 'review' ? 'text-pink-600 font-medium' : ''}>Review</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-pink-100 text-pink-600' : 'bg-green-100 text-green-600'}`}>
                                    {step === 'shipping' ? <MapPin size={20} /> : <CheckCircle size={20} />}
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900">Shipping Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.name}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={shippingAddress.email}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={shippingAddress.phone}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="+254 712 345 678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.country}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        readOnly
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.street}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="123 Kimathi Street"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.city}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="Nairobi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">State/County</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.state}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="Nairobi County"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ZIP/Postal Code</label>
                                    <input
                                        type="text"
                                        value={shippingAddress.zip}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="00100"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setStep('payment')}
                                    disabled={!isShippingValid}
                                    className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>

                        {/* Payment Method */}
                        {step !== 'shipping' && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-pink-100 text-pink-600' : 'bg-green-100 text-green-600'}`}>
                                        {step === 'payment' ? <CreditCard size={20} /> : <CheckCircle size={20} />}
                                    </div>
                                    <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    {/* M-Pesa */}
                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'mpesa' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-300'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="mpesa"
                                            checked={paymentMethod === 'mpesa'}
                                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                                            className="w-4 h-4 text-pink-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">M-Pesa</p>
                                            <p className="text-sm text-slate-500">Pay via M-Pesa mobile money</p>
                                        </div>
                                        <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                            M-Pesa
                                        </div>
                                    </label>

                                    {/* Credit Card */}
                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'card' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-300'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                                            className="w-4 h-4 text-pink-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">Credit/Debit Card</p>
                                            <p className="text-sm text-slate-500">Visa, Mastercard, etc.</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-8 h-5 bg-slate-800 rounded"></div>
                                            <div className="w-8 h-5 bg-slate-600 rounded"></div>
                                        </div>
                                    </label>

                                    {/* Cash on Delivery */}
                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-300'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                                            className="w-4 h-4 text-pink-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">Cash on Delivery</p>
                                            <p className="text-sm text-slate-500">Pay when you receive your order</p>
                                        </div>
                                        <Truck size={20} className="text-slate-400" />
                                    </label>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep('review')}
                                        className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition"
                                    >
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {cartArray.map((item, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden relative flex-shrink-0">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <span className="text-2xl">📦</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-medium text-pink-600">{currency}{(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4 border-slate-200" />

                            {/* Promo Code */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Try &quot;BEAUTY10&quot; for 10% off</p>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{currency}{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `${currency}${shipping.toFixed(2)}`}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{currency}{discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <hr className="my-4 border-slate-200" />

                            <div className="flex justify-between text-lg font-bold text-slate-900">
                                <span>Total</span>
                                <span>{currency}{finalTotal.toFixed(2)}</span>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={step !== 'review' || isProcessing}
                                className="w-full mt-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Place Order
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-500 text-center mt-3">
                                By placing this order, you agree to our Terms of Service
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
