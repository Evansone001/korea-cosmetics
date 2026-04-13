'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        if (!email.trim()) {
            setError('Please enter your email address')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset link')
            }

            setIsSubmitted(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <Image
                            src={assets.korea_logo}
                            alt="KoreaCosmetics' Hub"
                            width={180}
                            height={40}
                            className="mx-auto mb-4"
                        />
                    </Link>
                </div>

                {isSubmitted ? (
                    // Success State
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                            Check Your Email
                        </h1>
                        <p className="text-slate-600 mb-6">
                            If an account exists with <span className="font-medium">{email}</span>, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
                        </p>
                        <div className="space-y-3">
                            <Link 
                                href="/login"
                                className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                            >
                                Back to Login
                            </Link>
                            <button
                                onClick={() => {
                                    setIsSubmitted(false)
                                    setEmail('')
                                }}
                                className="block w-full py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                            >
                                Try Another Email
                            </button>
                        </div>
                    </div>
                ) : (
                    // Form State
                    <>
                        <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-slate-600 text-center mb-6">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link 
                                href="/login"
                                className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
