'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch } from '@/lib/hooks'
import { setUser } from '@/lib/features/auth/authSlice'
import { assets } from '@/assets/assets'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

function LoginContentWithSearchParams() {
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/'
    const router = useRouter()
    const dispatch = useAppDispatch()
    
    return (
        <LoginContent 
            router={router} 
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

function LoginContent({ router, dispatch, redirect }: { 
    router: any, 
    dispatch: any, 
    redirect: string 
}) {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Demo mode - pre-fill for testing
    useEffect(() => {
        // For demo purposes, you can pre-fill credentials
        // setEmail('admin@koreabeauty.com')
        // setPassword('admin123')
    }, [])

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
            console.log('[Login] API response:', { success: data.success, user: data.user })

            if (response.ok && data.success) {
                console.log('[Login] Login successful, dispatching setUser with role:', data.user?.role)
                dispatch(setUser(data.user))
                
                // Role-based redirect logic
                let finalRedirect = redirect
                if (redirect === '/') {
                    // Only apply role-based redirect if no specific redirect was requested
                    if (data.user?.role === 'admin') {
                        finalRedirect = '/admin'
                    } else if (data.user?.role === 'seller') {
                        finalRedirect = '/store'
                    }
                }
                
                console.log('[Login] Redux dispatch complete, redirecting to:', finalRedirect)
                
                // Small delay to ensure Redux updates
                setTimeout(() => {
                    console.log('[Login] Executing redirect to:', finalRedirect)
                    router.push(finalRedirect)
                }, 100)
            } else {
                console.log('[Login] Login failed:', data.error)
                setError(data.error || 'Invalid email or password')
            }
        } catch (err) {
            console.error('[Login] Login error:', err)
            setError('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center">
                        <div className="relative w-16 h-16">
                            <Image 
                                src={assets.korea_logo} 
                                alt="KoreaBeauty Hub"
                                fill
                                className="object-cover rounded-xl shadow-lg"
                            />
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500 mt-1">Sign in to your KoreaBeauty Hub account</p>
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

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm">
                        <p className="font-medium text-slate-700 mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-slate-600">
                            <p><span className="font-medium">Admin:</span> admin@koreabeauty.com / admin123</p>
                            <p><span className="font-medium">Seller:</span> seller@koreabeauty.com / seller123</p>
                            <p><span className="font-medium">Customer:</span> customer@koreabeauty.com / customer123</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mt-6 flex items-center">
                        <div className="flex-1 border-t border-slate-200" />
                        <span className="px-4 text-slate-500 text-sm">or</span>
                        <div className="flex-1 border-t border-slate-200" />
                    </div>

                    {/* Social Login */}
                    <div className="mt-6 space-y-3">
                        <button className="w-full flex items-center justify-center space-x-2 border border-slate-300 py-3 rounded-lg hover:bg-slate-50 transition">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-slate-700 font-medium">Continue with Google</span>
                        </button>
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
