import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
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
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isSocialAuthLoading: boolean
  socialAuthError: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSocialAuthLoading: false,
  socialAuthError: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.isLoading = false
      state.isSocialAuthLoading = false
      state.socialAuthError = null
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isSocialAuthLoading = false
      state.socialAuthError = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSocialAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isSocialAuthLoading = action.payload
    },
    setSocialAuthError: (state, action: PayloadAction<string | null>) => {
      state.socialAuthError = action.payload
    },
    clearSocialAuthState: (state) => {
      state.isSocialAuthLoading = false
      state.socialAuthError = null
    },
  },
})

export const { setUser, logout, setLoading, setSocialAuthLoading, setSocialAuthError, clearSocialAuthState } = authSlice.actions
export default authSlice.reducer
