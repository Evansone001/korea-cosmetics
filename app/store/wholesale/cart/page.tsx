'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateQuantity as updateQuantityAction, removeFromCart as removeFromCartAction, clearCart } from '@/lib/features/wholesaleCart/wholesaleCartSlice';
import { WholesaleCartItem } from '@/types';
import {
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import AddressModal from '@/components/AddressModal';

export default function WholesaleCartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state?.auth || { user: null });
  const { items: cartItems, totalItems: cartItemCount, subtotal: cartSubtotal } = useAppSelector(state => state?.wholesaleCart || { items: [], totalItems: 0, subtotal: 0 });
  const [discountCode, setDiscountCode] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchStoreData();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiClient.getAddresses();
      setAddresses(response?.addresses || []);
      if (response?.addresses && response.addresses.length > 0) {
        setSelectedAddressId(response.addresses[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Unable to load addresses. Please try again.'
      toast.error(errorMessage)
    }
  };

  const fetchStoreData = async () => {
    if (user?.role === 'seller') {
      try {
        const response: any = await apiClient.getMyStore();
        if (response?.store) {
          setStoreData(response.store);
        }
      } catch (error: any) {
        console.error('Error fetching store data:', error);
        const errorMessage = error?.response?.data?.error || error?.message || 'Unable to load store information. Please try again.'
        toast.error(errorMessage)
      }
    }
  };

  const handleAddressCreated = (newAddress: any) => {
    fetchAddresses();
    setSelectedAddressId(newAddress.id);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    dispatch(updateQuantityAction({ productId, delta }));
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeFromCartAction(productId));
    toast.success('Item removed from cart');
  };

  const cartTotals = {
    subtotal: cartSubtotal,
    itemCount: cartItemCount,
    discount: discountCode === 'WHOLESALE5' ? cartSubtotal * 0.05 : 0,
  };
  cartTotals.discount = Math.round(cartTotals.discount * 100) / 100;
  const taxableAmount = cartTotals.subtotal - cartTotals.discount;
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = taxableAmount + tax;

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setShowAddressModal(true);
      return;
    }

    setPlacingOrder(true);
    try {
      // Purchase each cart item from warehouse
      const purchasePromises = cartItems.map(async (item: WholesaleCartItem) => {
        return await apiClient.purchaseFromWholesale(item.id, item.cartQuantity, discountCode, selectedAddressId);
      });

      const results = await Promise.allSettled(purchasePromises);
      
      // Check if all purchases succeeded
      const failedPurchases = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected');
      if (failedPurchases.length > 0) {
        toast.error(`${failedPurchases.length} item(s) failed to purchase`);
        return;
      }

      toast.success('B2B order placed successfully!');
      dispatch(clearCart());
      router.push('/store/wholesale/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-500 mb-6">
            Your wholesale order has been submitted. We&apos;ll send you payment instructions via email.
          </p>
          <div className="flex gap-3">
            <Link
              href="/store/wholesale"
              className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/store/inventory"
              className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors text-center"
            >
              View Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/store/wholesale"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Catalog
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Wholesale Cart</h1>
              <p className="text-slate-500 mt-1">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6">Add products from the wholesale catalog to get started</p>
            <Link
              href="/store/wholesale"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.images[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="text-slate-300" size={32} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.manufacturer}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.category}</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          Min: {item.minOrderQuantity} {item.unit}s
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {item.profitMargin}% margin
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateCartQuantity(item.id, -item.minOrderQuantity)}
                            className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium w-12 text-center">{item.cartQuantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.minOrderQuantity)}
                            className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            ${(item.wholesalePrice * item.cartQuantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            ${item.wholesalePrice.toFixed(2)} / {item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
                <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>

                {/* Address Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Shipping Address</label>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      + Add new
                    </button>
                  </div>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {addresses.length === 0 ? (
                      <option value="">No addresses available</option>
                    ) : (
                      addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.street}, {addr.city}, {addr.state} {addr.zip}
                        </option>
                      ))
                    )}
                  </select>
                  {addresses.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Add a shipping address to place your order
                    </p>
                  )}
                </div>

                {/* Discount Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Discount Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    {discountCode === 'WHOLESALE5' && (
                      <CheckCircle2 className="text-green-500" size={20} />
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span>${cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  {cartTotals.discount > 0 ? (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${cartTotals.discount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder || !selectedAddressId}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
                >
                  {placingOrder ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CreditCard size={18} />
                  )}
                  Place Order
                </button>

                <Link
                  href="/store/wholesale"
                  className="block text-center text-sm text-slate-600 hover:text-slate-900 mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          setShowAddressModal={setShowAddressModal}
          onAddressCreated={handleAddressCreated}
          userData={user || undefined}
          storeData={storeData}
        />
      )}
    </div>
  );
}
