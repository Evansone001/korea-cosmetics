import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ProductState, Product } from '@/types'

const initialState: ProductState = {
    list: [],
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProduct: (state, action: PayloadAction<Product[]>) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer
