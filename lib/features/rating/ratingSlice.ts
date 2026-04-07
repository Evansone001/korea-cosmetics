import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RatingState, Rating } from '@/types'

const initialState: RatingState = {
    ratings: [],
}

const ratingSlice = createSlice({
    name: 'rating',
    initialState,
    reducers: {
        addRating: (state, action: PayloadAction<Rating>) => {
            state.ratings.push(action.payload)
        },
        setRatings: (state, action: PayloadAction<Rating[]>) => {
            state.ratings = action.payload
        },
        clearRatings: (state) => {
            state.ratings = []
        },
    }
})

export const { addRating, setRatings, clearRatings } = ratingSlice.actions

export default ratingSlice.reducer
