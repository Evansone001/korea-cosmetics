import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { CartState } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

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
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }
            
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                headers,
                credentials: 'include',
            })
            const data = await response.json()
            
            if (!response.ok) {
                return rejectWithValue(data.error)
            }
            
            // Convert array to object format
            const cartItems: Record<string, number> = {}
            let total = 0
            
            data.cart.forEach((item: { productId: string; quantity: number }) => {
                cartItems[item.productId] = item.quantity
                total += item.quantity
            })
            
            return { cartItems, total }
        } catch (error) {
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
        },
        deleteItemFromCart: (state, action: PayloadAction<{ productId: string }>) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
        clearCartError: (state) => {
            state.error = null
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
