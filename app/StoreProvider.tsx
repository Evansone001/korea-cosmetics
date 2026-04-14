'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { setUser, setLoading } from '../lib/features/auth/authSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip if user already exists in Redux (set during login)
      if (user) {
        console.log('[StoreProvider] User already in Redux, skipping /api/auth/me call')
        // Make sure loading is false since we have a user
        dispatch(setLoading(false))
        return
      }

      // Check /api/auth/me - browser will send httpOnly cookie automatically
      console.log('[StoreProvider] Initializing auth, calling /api/auth/me')
      try {
        dispatch(setLoading(true))
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        console.log('[StoreProvider] /api/auth/me response:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('[StoreProvider] /api/auth/me data:', data)
          if (data.user) {
            console.log('[StoreProvider] Setting user:', data.user.name)
            dispatch(setUser(data.user))
          } else {
            console.log('[StoreProvider] No user in response')
          }
        } else {
          console.log('[StoreProvider] /api/auth/me not ok:', response.status)
        }
      } catch (error) {
        console.error('[StoreProvider] Failed to initialize auth:', error)
      } finally {
        dispatch(setLoading(false))
      }
    }

    initializeAuth()
  }, [dispatch, user])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<any>(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
