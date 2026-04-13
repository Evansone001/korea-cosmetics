'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/hooks'
import { setUser, setSocialAuthLoading, setSocialAuthError } from '@/lib/features/auth/authSlice'
import { apiClient } from '@/lib/api-client'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        dispatch(setSocialAuthLoading(true))
        dispatch(setSocialAuthError(null))

        // Check for OAuth errors
        const error = searchParams.get('error')
        if (error) {
          throw new Error(error)
        }

        // Get current user from Flask backend after OAuth
        const response = await apiClient.getCurrentUser() as { user: any }
        
        if (response && response.user) {
          dispatch(setUser(response.user))
          
          // Determine redirect based on user role
          let redirectPath = '/'
          switch (response.user.role) {
            case 'admin':
              redirectPath = '/admin'
              break
            case 'seller':
              redirectPath = '/store'
              break
            case 'customer':
              redirectPath = '/orders'
              break
          }
          
          router.push(redirectPath)
        } else {
          throw new Error('No user data received from authentication')
        }
      } catch (error) {
        console.error('Social auth callback error:', error)
        dispatch(setSocialAuthError('Authentication failed. Please try again.'))
        router.push('/login?error=social_auth_failed')
      } finally {
        dispatch(setSocialAuthLoading(false))
      }
    }

    handleCallback()
  }, [searchParams, router, dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
