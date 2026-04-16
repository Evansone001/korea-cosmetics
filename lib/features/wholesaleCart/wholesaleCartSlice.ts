import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface WholesaleProduct {
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

export interface WholesaleCartItem extends WholesaleProduct {
  cartQuantity: number;
}

interface WholesaleCartState {
  items: WholesaleCartItem[];
  totalItems: number;
  subtotal: number;
}

const initialState: WholesaleCartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
}

const wholesaleCartSlice = createSlice({
  name: 'wholesaleCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: WholesaleProduct; quantity: number }>) => {
      const { product, quantity } = action.payload
      
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.cartQuantity += quantity
      } else {
        state.items.push({ ...product, cartQuantity: quantity })
      }
      
      // Update totals
      state.totalItems += quantity
      state.subtotal += product.wholesalePrice * quantity
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      const itemIndex = state.items.findIndex(item => item.id === productId)
      
      if (itemIndex !== -1) {
        const item = state.items[itemIndex]
        state.totalItems -= item.cartQuantity
        state.subtotal -= item.wholesalePrice * item.cartQuantity
        state.items.splice(itemIndex, 1)
      }
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; delta: number }>) => {
      const { productId, delta } = action.payload
      const item = state.items.find(item => item.id === productId)
      
      if (item) {
        const newQuantity = item.cartQuantity + delta
        
        if (newQuantity < item.minOrderQuantity) {
          // Don't allow quantity below minimum
          return
        }
        
        if (newQuantity <= 0) {
          // Remove item if quantity becomes 0 or negative
          state.totalItems -= item.cartQuantity
          state.subtotal -= item.wholesalePrice * item.cartQuantity
          state.items = state.items.filter(i => i.id !== productId)
        } else {
          // Update quantity
          state.totalItems += delta
          state.subtotal += item.wholesalePrice * delta
          item.cartQuantity = newQuantity
        }
      }
    },
    
    deleteItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      const item = state.items.find(item => item.id === productId)
      
      if (item) {
        state.totalItems -= item.cartQuantity
        state.subtotal -= item.wholesalePrice * item.cartQuantity
        state.items = state.items.filter(i => i.id !== productId)
      }
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.subtotal = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, deleteItem, clearCart } = wholesaleCartSlice.actions

export default wholesaleCartSlice.reducer
