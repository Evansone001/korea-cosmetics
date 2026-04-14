'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { useAppDispatch } from '../lib/hooks'
import { setUser, setLoading } from '../lib/features/auth/authSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeAuth = async () => {
      // Always check /api/auth/me - browser will send httpOnly cookie automatically
      try {
        dispatch(setLoading(true))
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            dispatch(setUser(data.user))
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        dispatch(setLoading(false))
      }
    }

    initializeAuth()
  }, [dispatch])

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
