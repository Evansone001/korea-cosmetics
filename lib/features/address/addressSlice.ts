import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Only store address ID and basic non-PII info
interface AddressSummary {
  id: string
  label?: string // e.g., "Home", "Work"
  city?: string  // City only, not full address
}

interface AddressState {
  selectedAddressId: string | null
  addressList: AddressSummary[] // Store minimal info, not full addresses
}

const initialState: AddressState = {
  selectedAddressId: null,
  addressList: [],
}

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    selectAddress: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload
    },
    clearAddress: (state) => {
      state.selectedAddressId = null
    },
    setAddressList: (state, action: PayloadAction<AddressSummary[]>) => {
      state.addressList = action.payload
    },
    addAddressToList: (state, action: PayloadAction<AddressSummary>) => {
      state.addressList.push(action.payload)
    },
  },
})

export const { selectAddress, clearAddress, setAddressList, addAddressToList } = addressSlice.actions

export default addressSlice.reducer
