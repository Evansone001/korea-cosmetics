'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { setUser, setLoading } from '../lib/features/auth/authSlice'

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
        console.log('[StoreProvider] Auth initialization complete')
      }
    }
    initializeAuth()
  }, [dispatch])

  return <>{children}</>
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<any>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}