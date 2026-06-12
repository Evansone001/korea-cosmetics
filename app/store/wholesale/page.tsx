'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToCart as addToCartAction, updateQuantity as updateQuantityAction, removeFromCart as removeFromCartAction, clearCart } from '@/lib/features/wholesaleCart/wholesaleCartSlice';
import { WholesaleCartItem } from '@/types';
import {
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Building2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import AddressModal from '@/components/AddressModal';

interface WholesaleProduct {
  id: string;
  name: string;
  description: string;
  wholesalePrice: number;
  retailPrice: number;
  mrp?: number;
  category: string;
  manufacturer: string;
  images: string[];
  minOrderQuantity: number;
  availableStock: number;
  unit: string;
  origin: string;
  profitMargin: number;
}

interface CartItem extends WholesaleProduct {
  cartQuantity: number;
}

export default function WholesaleStorePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state?.auth || { user: null });
  const { items: cartItems, totalItems: cartItemCount, subtotal: cartSubtotal } = useAppSelector(state => state?.wholesaleCart || { items: [], totalItems: 0, subtotal: 0 });
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [discountCode, setDiscountCode] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);

  const categories = ['Skincare', 'Makeup', 'Haircare', 'Bodycare', 'Fragrance'];

  useEffect(() => {
    fetchProducts();
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
    // Refresh addresses list and select the new address
    fetchAddresses();
    setSelectedAddressId(newAddress.id);
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getStoreWholesaleCatalog({
        category: selectedCategory || undefined,
        search: searchQuery || undefined
      });
      setProducts(response?.products || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Unable to load catalog. Please try again.'
      toast.error(errorMessage)
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: WholesaleProduct, quantity: number) => {
    if (quantity < product.minOrderQuantity) {
      toast.error(`Minimum order is ${product.minOrderQuantity} ${product.unit}s`);
      return;
    }

    dispatch(addToCartAction({ product, quantity }));
    toast.success(`Added ${quantity} ${product.unit}s to cart`);
    setShowCart(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    dispatch(updateQuantityAction({ productId, delta }));
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeFromCartAction(productId));
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wholesale Catalog</h1>
          <p className="text-slate-500 mt-1">
            Buy Korean beauty products in bulk from our suppliers
          </p>
        </div>
        <Link
          href="/store/wholesale/cart"
          className="relative flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ShoppingCart size={20} />
          Cart
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products */}
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square bg-slate-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-slate-300" size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                    {product.origin}
                  </div>
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    {product.profitMargin}% margin
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{product.manufacturer}</p>
                  <h3 className="font-medium text-slate-900 mt-1">{product.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">{product.category}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">Min: {product.minOrderQuantity} {product.unit}s</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-500">Wholesale</span>
                        <p className="font-bold text-slate-900">${product.wholesalePrice.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Suggested Retail</span>
                        <p className="font-medium text-slate-600">${product.retailPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={product.minOrderQuantity}
                        defaultValue={product.minOrderQuantity}
                        id={`qty-${product.id}`}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`qty-${product.id}`) as HTMLInputElement;
                          addToCart(product, parseInt(input.value));
                        }}
                        disabled={product.availableStock < product.minOrderQuantity}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
                      >
                        <Plus size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="lg:col-span-1 fixed inset-0 lg:static lg:inset-auto z-50 lg:z-auto">
            <div className="absolute inset-0 lg:static bg-black/50 lg:bg-transparent" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 bottom-0 lg:static w-full lg:w-auto bg-white rounded-xl border border-slate-200 lg:sticky lg:top-4 overflow-y-auto lg:max-h-[calc(100vh-2rem)]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Your Cart
                  <span className="text-sm text-slate-500">({cartItemCount} items)</span>
                  <Link
                    href="/store/wholesale/cart"
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium ml-auto"
                  >
                    View Full Cart
                  </Link>
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {cartItems.map((item: WholesaleCartItem) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="text-slate-300" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500">{item.manufacturer}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateCartQuantity(item.id, -item.minOrderQuantity)}
                              className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-medium w-12 text-center">{item.cartQuantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.minOrderQuantity)}
                              className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            ${(item.wholesalePrice * item.cartQuantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-200 space-y-3">
                    {/* Address Selection */}
                    <div>
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      {discountCode === 'WHOLESALE5' && (
                        <CheckCircle2 className="text-green-500" size={20} />
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
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
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {placingOrder ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CreditCard size={18} />
                      )}
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {checkoutStep === 'success' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
            <p className="text-slate-500 mb-6">
              Your wholesale order has been submitted. We&apos;ll send you payment instructions via email.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCheckoutStep('cart')}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Continue Shopping
              </button>
              <Link
                href="/store/inventory"
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors text-center"
              >
                View Inventory
              </Link>
            </div>
          </div>
        </div>
      )}

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
