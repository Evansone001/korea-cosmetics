'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch } from '@/lib/hooks'
import { setUser, setAuthenticated } from '@/lib/features/auth/authSlice'
import { assets } from '@/assets/assets'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import SocialLoginButton from '@/components/auth/SocialLoginButton'
import SocialAuthDivider from '@/components/auth/SocialAuthDivider'
import { useSocialAuth } from '@/hooks/useSocialAuth'

function LoginContentWithSearchParams() {
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/'
    const dispatch = useAppDispatch()
    
    return (
        <LoginContent 
            dispatch={dispatch} 
            redirect={redirect} 
        />
    )
}

export default function Login() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContentWithSearchParams />
        </Suspense>
    )
}

function LoginContent({ dispatch, redirect }: { 
    dispatch: any, 
    redirect: string 
}) {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    
    const { isLoading: isSocialAuthLoading, error: socialAuthError, initiateGoogleAuth, initiateGitHubAuth, clearError } = useSocialAuth()

    // Handle social auth errors
    useEffect(() => {
        if (socialAuthError) {
            setError(socialAuthError)
            clearError()
        }
    }, [socialAuthError, clearError])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        console.log('[Login] Starting login attempt for:', email)

        try {
            console.log('[Login] Calling /api/auth/login')
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            })

            const data = await response.json()
            console.log('[Login] API response:', { success: data.success, user: data.user, access_token: !!data.access_token })

            // Backend returns { access_token, message, user } without success field
            if (response.ok && data.access_token) {
                console.log('[Login] Login successful, dispatching setUser with role:', data.user?.role)
                
                // Store token in localStorage for API client
                localStorage.setItem('auth-token', data.access_token)
                
                dispatch(setUser(data.user))
                dispatch(setAuthenticated(true))
                
                // Role-based redirect logic
                let finalRedirect = redirect

                // Apply role-based redirect based on user's role
                if (data.user?.role === 'admin' || data.user?.role === 'super_admin') {
                    // Admin and super_admin users should go to admin dashboard unless redirecting to a non-dashboard page
                    if (redirect === '/' || redirect === '/store') {
                        finalRedirect = '/admin'
                    }
                } else if (data.user?.role === 'seller') {
                    // Seller users should go to seller dashboard unless redirecting to a non-dashboard page
                    if (redirect === '/' || redirect === '/admin') {
                        finalRedirect = '/store'
                    }
                } else if (data.user?.role === 'customer') {
                    // Customer users should go to orders if no specific redirect
                    if (redirect === '/') {
                        finalRedirect = '/orders'
                    }
                }
                
                console.log('[Login] Redux dispatch complete, redirecting to:', finalRedirect)
                
                // Full page reload to ensure StoreProvider runs auth check
                console.log('[Login] Executing full page redirect to:', finalRedirect)
                window.location.href = finalRedirect
            } else {
                console.log('[Login] Login failed:', data.error)
                setError(data.error || 'Invalid email or password')
                setIsLoading(false)
            }
        } catch (err) {
            console.error('[Login] Login error:', err)
            setError('Login failed. Please try again.')
            setIsLoading(false)
        }
        // Note: isLoading stays true on success until page redirects
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4 relative">
            {/* Full-page loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-700 font-medium">Signing in...</p>
                    </div>
                </div>
            )}

            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center">
                        <div className="relative w-16 h-16">
                            <Image 
                                src={assets.korea_logo} 
                                alt="KoreaCosmetics' Hub"
                                fill
                                className="object-cover rounded-xl shadow-lg"
                            />
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500 mt-1">Sign in to your KoreaCosmetics' Hub account</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-pink-600 hover:text-pink-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-medium hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Auth Divider */}
                    <SocialAuthDivider className="mt-6" />

                    {/* Social Login */}
                    <div className="mt-6 space-y-3">
                        <SocialLoginButton
                            provider="google"
                            onClick={initiateGoogleAuth}
                            isLoading={isSocialAuthLoading}
                        />
                        <SocialLoginButton
                            provider="github"
                            onClick={initiateGitHubAuth}
                            isLoading={isSocialAuthLoading}
                        />
                    </div>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-slate-600">
                        Don't have an account?{' '}
                        <Link href={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-pink-600 hover:text-pink-700 font-medium">
                            Create account
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
