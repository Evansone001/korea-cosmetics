'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '../lib/store'
import { useAppDispatch } from '../lib/hooks'
import { setUser, setLoading, setAuthChecked } from '../lib/features/auth/authSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  console.log('[StoreProvider] AuthInitializer MOUNTING, window:', typeof window !== 'undefined')

  useEffect(() => {
    console.log('[StoreProvider] useEffect RUNNING')
    const initializeAuth = async () => {
      console.log('[StoreProvider] Starting auth initialization')
      try {
        dispatch(setLoading(true))
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        })
        console.log('[StoreProvider] /api/auth/me response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('[StoreProvider] /api/auth/me response data:', data)
          if (data?.user) {
            console.log('[StoreProvider] Setting user in Redux:', data.user.name)
            dispatch(setUser(data.user))
          } else {
            dispatch(setUser(null))
          }
        } else {
          dispatch(setUser(null))
        }
      } catch (error) {
        console.error('[StoreProvider] Failed to initialize auth:', error)
        dispatch(setUser(null))
      } finally {
        dispatch(setLoading(false))
        dispatch(setAuthChecked(true))
        console.log('[StoreProvider] Auth initialization complete')
      }
    }
    initializeAuth()
  }, [dispatch])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}