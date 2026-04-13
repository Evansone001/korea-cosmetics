'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  setSocialAuthLoading, 
  setSocialAuthError, 
  clearSocialAuthState,
  setUser 
} from '@/lib/features/auth/authSlice'
import { apiClient } from '@/lib/api-client'

interface UseSocialAuthReturn {
  isLoading: boolean
  error: string | null
  initiateGoogleAuth: () => void
  initiateGitHubAuth: () => void
  clearError: () => void
}

export const useSocialAuth = (): UseSocialAuthReturn => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isSocialAuthLoading, socialAuthError } = useAppSelector((state) => state.auth)

  const initiateAuth = useCallback((provider: 'google' | 'github') => {
    try {
      dispatch(setSocialAuthLoading(true))
      dispatch(setSocialAuthError(null))

      // Get OAuth URL from API client
      const authUrl = provider === 'google' 
        ? `${apiClient.getGoogleAuthUrl()}`
        : `${apiClient.getGitHubAuthUrl()}`

      // Redirect to OAuth provider
      window.location.href = authUrl
    } catch (error) {
      console.error(`Failed to initiate ${provider} auth:`, error)
      dispatch(setSocialAuthError(`Failed to connect to ${provider}. Please try again.`))
      dispatch(setSocialAuthLoading(false))
    }
  }, [dispatch])

  const initiateGoogleAuth = useCallback(() => {
    initiateAuth('google')
  }, [initiateAuth])

  const initiateGitHubAuth = useCallback(() => {
    initiateAuth('github')
  }, [initiateAuth])

  const clearError = useCallback(() => {
    dispatch(setSocialAuthError(null))
  }, [dispatch])

  return {
    isLoading: isSocialAuthLoading,
    error: socialAuthError,
    initiateGoogleAuth,
    initiateGitHubAuth,
    clearError,
  }
}

// Hook for handling OAuth callback
export const useSocialAuthCallback = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleCallback = useCallback(async (provider: 'google' | 'github') => {
    try {
      dispatch(setSocialAuthLoading(true))
      dispatch(setSocialAuthError(null))

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
  }, [dispatch, router])

  return { handleCallback }
}
