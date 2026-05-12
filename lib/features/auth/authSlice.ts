import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '@/types'
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

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSocialAuthLoading: false,
  socialAuthError: null,
  authChecked: false,
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

      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('auth-user', JSON.stringify(action.payload))
          localStorage.setItem('auth-timestamp', Date.now().toString())
        } else {
          localStorage.removeItem('auth-user')
          localStorage.removeItem('auth-timestamp')
        }
      }
    },

    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isSocialAuthLoading = false
      state.socialAuthError = null
      state.authChecked = true

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-user')
        localStorage.removeItem('auth-timestamp')
        localStorage.removeItem('auth-token')
        localStorage.removeItem('refresh-token')

        // Clear cookies for middleware compatibility
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.authChecked = action.payload
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

    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
  },
})

export const {
  setUser,
  logout,
  setLoading,
  setAuthChecked,
  setSocialAuthLoading,
  setSocialAuthError,
  clearSocialAuthState,
  setAuthenticated,
} = authSlice.actions

export const isAuthStateValid = (): boolean => {
  if (typeof window === 'undefined') return false

  const cachedTimestamp = localStorage.getItem('auth-timestamp')
  if (!cachedTimestamp) return false

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const age = Date.now() - parseInt(cachedTimestamp)
  return age < CACHE_DURATION
}

export default authSlice.reducer