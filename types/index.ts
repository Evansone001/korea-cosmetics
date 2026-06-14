// Core Data Types for korea-cosmetics E-commerce Platform
import type { StaticImageData } from 'next/image'

export interface User {
  id: string; 
  name: string;
  email: string;
  image?: string | StaticImageData;
  cart?: Record<string, number>;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  username?: string;
  description: string; 
  address: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  logo?: string | StaticImageData;
  email: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// BACKEND DTO (what Flask expects)
export interface StoreCreateDTO {
  name: string;
  description: string;
  username: string;
  email: string;

  phone?: string | null;

  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;

  business_hours?: Record<string, any> | null;
  social_media?: Record<string, any> | null;
  return_policy?: Record<string, any> | null;
  shipping_policy?: Record<string, any> | null;
}

// FRONTEND FORM MODEL (UI state)
export interface StoreFormValues {
  storeName: string;
  storeDescription: string;
  username: string;
  email: string;

  phone?: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  businessHours?: any;
  socialMedia?: any;
  returnPolicy?: any;
  shippingPolicy?: any;
}

export interface Rating {
  id: string;
  rating: number;
  review: string;
  user: {
    name: string;
    image?: string | StaticImageData;
  };
  productId: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  product: {
    name: string;
    category: string;
    id: string;
  };
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  images: (string | StaticImageData)[];
  category: string;
  storeId: string;
  inStock: boolean;
  stock_quantity?: number;
  store?: Store;
  rating: Rating[];
  createdAt: string;
  updatedAt: string;
  // Korean beauty product fields
  brand?: string;
  size?: string;
  formula?: string;
  howToUse?: string;
  keyBenefits?: string[];
  keyIngredients?: string[];
  skinTypes?: string;
  skinConcerns?: string;
  texture?: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  createdAt: string;
}

export interface OrderItem {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  userId: string;
  storeId: string;
  addressId: string;
  isPaid: boolean;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  isCouponUsed?: boolean;
  coupon?: Rating | Coupon;
  orderItems: OrderItem[];
  address: Address;
  user: User;
}

export interface Coupon {
  code: string;
  description: string;
  discount: number;
  forNewUser: boolean;
  forMember: boolean;
  isPublic: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  total: number;
  cartItems: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

export interface ProductState {
  list: Product[];
}

export interface AddressSummary {
  id: string;
  label?: string;
  city?: string;
}

export interface AddressState {
  selectedAddressId: string | null;
  addressList: AddressSummary[];
}

export interface RatingState {
  ratings: Rating[];
}

export interface AuthState {
  user: {
    id: string
    email: string
    name: string
    role: 'customer' | 'seller' | 'admin' | 'super_admin'
    image?: string
    email_verified: boolean
    auth_provider: 'email' | 'google' | 'github' | null
    last_login_method: 'email' | 'google' | 'github'
    phone?: string
    first_name?: string
    last_name?: string
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  isSocialAuthLoading: boolean
  socialAuthError: string | null
  authChecked: boolean // ✅ ADD THIS HERE
}

export interface WholesaleCartItem {
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
  cartQuantity: number;
}

export interface WholesaleCartState {
  items: WholesaleCartItem[];
  totalItems: number;
  subtotal: number;
}

export interface RootState {
  cart: CartState;
  product: ProductState;
  address: AddressState;
  rating: RatingState;
  auth: AuthState;
  wholesaleCart: WholesaleCartState;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
}

export interface NavbarProps {
  // Add any specific navbar props if needed
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export interface StoreLayoutProps {
  children: React.ReactNode;
  
}

// Utility Types
export type Currency = string;
export type Category = string;
export type OrderStatus = Order["status"];
export type StoreStatus = Store["status"];
