'use client'

import Link from "next/link";
import { useState } from "react";
import type { CartItem } from "@/types";

interface OrderSummaryProps {
    totalPrice: number;
    items: CartItem[];
}

const OrderSummary = ({ totalPrice, items }: OrderSummaryProps) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [promoCode, setPromoCode] = useState('');
    
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const shipping = totalPrice > 500 ? 0 : 50;
    const discount = 0;
    const finalTotal = totalPrice + shipping - discount;

    return (
        <div className="w-full max-w-md bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-slate-600 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{currency}{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `${currency}${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-{currency}{discount}</span>
                </div>
            </div>

            <hr className="my-4 border-slate-200" />

            <div className="flex justify-between text-lg font-semibold text-slate-800">
                <span>Total</span>
                <span>{currency}{finalTotal.toLocaleString()}</span>
            </div>

            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition">
                    Apply
                </button>
            </div>

            <Link
                href="/checkout"
                className="block mt-6 w-full py-3 bg-pink-600 text-white text-center rounded-md font-semibold hover:bg-pink-700 active:scale-95 transition-all"
            >
                Proceed to Checkout
            </Link>
        </div>
    );
};

export default OrderSummary;
