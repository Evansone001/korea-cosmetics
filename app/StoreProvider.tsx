'use client'

import { useEffect, useRef, useState } from 'react'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from '../lib/store'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { setUser, setLoading, setAuthChecked } from '../lib/features/auth/authSlice'
import { fetchCart } from '../lib/features/cart/cartSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const initializedRef = useRef(false)
  const cartInitializedRef = useRef(false)
  const [initialized, setInitialized] = useState(false)
  const mountCount = useRef(0)

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  mountCount.current += 1
  console.log('[StoreProvider] AuthInitializer MOUNTING, window:', typeof window !== 'undefined', 'mount count:', mountCount.current)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    console.log('[StoreProvider] useEffect RUNNING')
    const initializeAuth = async () => {
      console.log('[StoreProvider] Starting auth initialization')
      try {
        dispatch(setLoading(true))

        // Check for cached auth state in localStorage
        if (typeof window !== 'undefined') {
          const cachedUser = localStorage.getItem('auth-user')
          const cachedTimestamp = localStorage.getItem('auth-timestamp')

          if (cachedUser && cachedTimestamp) {
            const age = Date.now() - parseInt(cachedTimestamp)
            if (age < CACHE_DURATION) {
              // Use cached state if still valid
              console.log('[StoreProvider] Using cached auth state, age:', age, 'ms')
              const user = JSON.parse(cachedUser)
              dispatch(setUser(user))
              dispatch(setAuthChecked(true))
              dispatch(setLoading(false))
              setInitialized(true)
              return
            } else {
              console.log('[StoreProvider] Cached state expired, age:', age, 'ms')
            }
          }
        }

        // Check token in cookies
        let token = null
        if (typeof window !== 'undefined') {
          const cookies = document.cookie.split(';')
          const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
          if (authCookie) {
            token = authCookie.split('=')[1]
          }
        }

        if (!token) {
          console.log('[StoreProvider] No token found in cookies, user not authenticated')
          dispatch(setUser(null))
          dispatch(setAuthChecked(true))
          dispatch(setLoading(false))
          setInitialized(true)
          return
        }

        console.log('[StoreProvider] Token found in cookies, validating with API')

        // Only make API call if we have a token
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('[StoreProvider] /api/auth/me response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('[StoreProvider] /api/auth/me response data:', data)
          if (data?.user) {
            console.log('[StoreProvider] Setting user in Redux:', data.user.name)
            dispatch(setUser(data.user))
          } else {
            console.log('[StoreProvider] No user data in response, clearing auth')
            dispatch(setUser(null))
          }
        } else {
          console.log('[StoreProvider] API call failed, clearing auth')
          dispatch(setUser(null))
        }
      } catch (error) {
        console.error('[StoreProvider] Failed to initialize auth:', error)
        dispatch(setUser(null))
      } finally {
        dispatch(setLoading(false))
        dispatch(setAuthChecked(true))
        setInitialized(true)
        console.log('[StoreProvider] Auth initialization complete')
      }
    }

    initializeAuth()
  }, [dispatch])

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !cartInitializedRef.current) {
      cartInitializedRef.current = true
      console.log('[StoreProvider] User authenticated, fetching cart')
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryClientProvider>
    </Provider>
  )
}