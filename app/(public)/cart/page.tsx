'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import ImageWithFallback from "@/components/ImageWithFallback";
import { deleteItemFromCart, fetchCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { Product, CartItem } from "@/types";
import { apiClient } from "@/lib/api-client";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    
    const { cartItems } = useAppSelector(state => state.cart);

    const dispatch = useAppDispatch();

    const [cartArray, setCartArray] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCartProducts = async () => {
        setLoading(true);
        const productIds = Object.keys(cartItems);
        
        console.log('[Cart] cartItems:', cartItems);
        console.log('[Cart] productIds:', productIds);
        
        if (productIds.length === 0) {
            setCartArray([]);
            setTotalPrice(0);
            setLoading(false);
            return;
        }

        try {
            // Fetch product details in batch
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/products/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ product_ids: productIds }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('[Cart] Failed to fetch batch products:', data.error);
                // Fallback to individual fetches
                const productPromises = productIds.map(id => 
                    apiClient.getProduct(id).catch((err) => {
                        console.error(`[Cart] Failed to fetch product ${id}:`, err);
                        return null;
                    })
                );
                const products = await Promise.all(productPromises);
                processCartProducts(products, productIds);
            } else {
                console.log('[Cart] Fetched batch products:', data.products);
                processCartProducts(data.products, productIds);
            }
        } catch (error) {
            console.error('Failed to fetch cart products:', error);
            setLoading(false);
        }
    }

    const processCartProducts = (products: any[], productIds: string[]) => {
        const newCartArray: CartItem[] = [];
        let total = 0;
        
        productIds.forEach((id, index) => {
            const product = products[index] as Product | null;
            const quantity = cartItems[id];
            
            console.log(`[Cart] Processing item ${id}:`, { product, quantity });
            
            if (product && quantity && product.price) {
                newCartArray.push({
                    product: product,
                    quantity: quantity,
                });
                total += product.price * quantity;
            } else {
                console.log(`[Cart] Skipped item ${id}:`, {
                    hasProduct: !!product,
                    hasQuantity: !!quantity,
                    hasPrice: !!(product && product.price),
                    product,
                    quantity
                });
            }
        });
        
        console.log('[Cart] cartArray:', newCartArray);
        console.log('[Cart] total:', total);
        
        setCartArray(newCartArray);
        setTotalPrice(total);
        setLoading(false);
    }

    const handleDeleteItemFromCart = (productId: string) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    // Fetch cart from server on mount
    useEffect(() => {
        dispatch(fetchCart())
    }, [dispatch])

    // Fetch cart products whenever cartItems change
    useEffect(() => {
        fetchCartProducts()
    }, [cartItems])

    if (loading) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        );
    }

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">

            <div className="max-w-7xl mx-auto ">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">

                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th className="max-md:hidden">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cartArray.map((item, index) => (
                                    <tr key={index} className="space-x-2">
                                        <td className="flex gap-3 my-4">
                                            <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                                {item.product.images && item.product.images.length > 0 ? (
                                                    <ImageWithFallback src={item.product.images[0]} alt="" width={45} height={45} className="h-14 w-auto" />
                                                ) : (
                                                    <span className="text-2xl">📦</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="max-sm:text-sm">{item.product.name}</p>
                                                <p className="text-xs text-slate-500">{item.product.category}</p>
                                                <p>{currency}{item.product.price}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Counter productId={item.product.id} />
                                        </td>
                                        <td className="text-center">{currency}{(item.product.price * item.quantity).toLocaleString()}</td>
                                        <td className="text-center max-md:hidden">
                                            <button onClick={() => handleDeleteItemFromCart(item.product.id)} className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
        </div>
    )
}
