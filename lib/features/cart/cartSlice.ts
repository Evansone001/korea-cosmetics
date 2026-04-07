import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { CartState } from '@/types'

const initialState: CartState = {
    total: 0,
    cartItems: {},
    isLoading: false,
    error: null,
}

// Async thunk to fetch cart from server
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/cart', {
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
            // Convert object to array format
            const cart = Object.entries(cartItems).map(([productId, quantity]) => ({
                productId,
                quantity,
            }))
            
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
                credentials: 'include',
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
