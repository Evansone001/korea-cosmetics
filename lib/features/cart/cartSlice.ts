import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { CartState } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

// Local storage key for guest cart
const GUEST_CART_KEY = 'guest-cart-items'

// Helper functions for localStorage
const saveGuestCart = (cartItems: Record<string, number>) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems))
    }
}

const loadGuestCart = (): Record<string, number> => {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(GUEST_CART_KEY)
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (error) {
                console.error('Failed to parse guest cart:', error)
            }
        }
    }
    return {}
}

const clearGuestCart = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(GUEST_CART_KEY)
    }
}

const initialState: CartState = {
    total: 0,
    cartItems: {},
    isLoading: false,
    error: null,
}

// Helper function to get auth token from cookies/localStorage
const getAuthToken = (): string | null => {
    // Try to get token from cookies first
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
        if (authCookie) {
            return authCookie.split('=')[1];
        }
    }
    
    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('auth-token');
    }
    
    return null;
}

// Async thunk to fetch cart from server
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const token = getAuthToken()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            
            console.log('[fetchCart] Fetching cart from server, token present:', !!token)
            
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                headers,
                credentials: 'include',
            })
            const data = await response.json()
            
            console.log('[fetchCart] Response status:', response.status)
            console.log('[fetchCart] Response data:', data)
            
            if (!response.ok) {
                // Handle 401 gracefully for guest users
                if (response.status === 401) {
                    // Load guest cart from localStorage
                    const guestCart = loadGuestCart()
                    const total = Object.values(guestCart).reduce((sum, qty) => sum + qty, 0)
                    console.log('[fetchCart] 401 - loading guest cart:', guestCart)
                    return { cartItems: guestCart, total, isGuest: true }
                }
                return rejectWithValue(data.error)
            }
            
            // Convert array to object format
            const cartItems: Record<string, number> = {}
            let total = 0
            
            console.log('[fetchCart] Backend cart data:', data.cart)
            
            if (data.cart && Array.isArray(data.cart)) {
                data.cart.forEach((item: any) => {
                    // Handle different possible field names
                    const productId = item.productId || item.product_id || item.id
                    const quantity = item.quantity || item.qty || 1
                    if (productId && quantity) {
                        cartItems[productId] = quantity
                        total += quantity
                    }
                })
            }
            
            console.log('[fetchCart] Converted cartItems:', cartItems)
            console.log('[fetchCart] Total items:', total)
            
            // If backend cart is empty but user is authenticated, check localStorage
            if (token && Object.keys(cartItems).length === 0) {
                const guestCart = loadGuestCart()
                if (Object.keys(guestCart).length > 0) {
                    console.log('[fetchCart] Backend cart empty, merging with localStorage cart:', guestCart)
                    // Merge localStorage cart
                    Object.entries(guestCart).forEach(([productId, quantity]) => {
                        cartItems[productId] = quantity
                        total += quantity
                    })
                    // Sync merged cart to backend
                    try {
                        await fetch(`${API_BASE_URL}/api/cart`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ cart: Object.entries(cartItems).map(([productId, quantity]) => ({ productId, quantity })) }),
                        })
                    } catch (syncError) {
                        console.error('[fetchCart] Failed to sync merged cart:', syncError)
                    }
                }
            }
            
            // Clear guest cart after successful fetch for authenticated user
            if (token) {
                clearGuestCart()
            }
            
            return { cartItems, total, isGuest: false }
        } catch (error) {
            console.error('[fetchCart] Error:', error)
            return rejectWithValue('Failed to fetch cart')
        }
    }
)

// Async thunk to save cart to server
export const syncCart = createAsyncThunk(
    'cart/syncCart',
    async (cartItems: Record<string, number>, { rejectWithValue }) => {
        try {
            const token = getAuthToken()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            
            // Convert object to array format
            const cart = Object.entries(cartItems).map(([productId, quantity]) => ({
                productId,
                quantity,
            }))
            
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ cart }),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                return rejectWithValue(data.error)
            }
            
            return data.cart
        } catch (error) {
            return rejectWithValue('Failed to sync cart')
        }
    }
)

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{ productId: string }>) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
            // Save to localStorage for guest users
            saveGuestCart(state.cartItems)
        },
        removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
            // Save to localStorage for guest users
            saveGuestCart(state.cartItems)
        },
        deleteItemFromCart: (state, action: PayloadAction<{ productId: string }>) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
            // Save to localStorage for guest users
            saveGuestCart(state.cartItems)
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
            // Clear localStorage
            clearGuestCart()
        },
        clearCartError: (state) => {
            state.error = null
        },
        setCartItems: (state, action: PayloadAction<Record<string, number>>) => {
            state.cartItems = action.payload
            state.total = Object.values(action.payload).reduce((sum, qty) => sum + qty, 0)
            // Save to localStorage for guest users
            saveGuestCart(state.cartItems)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false
                state.cartItems = action.payload.cartItems
                state.total = action.payload.total
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            .addCase(syncCart.rejected, (state, action) => {
                state.error = action.payload as string
            })
    },
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, clearCartError } = cartSlice.actions

export default cartSlice.reducer
