import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = ['/orders', '/profile', '/cart/checkout']

// Routes that require seller role
const SELLER_REQUIRED_ROUTES = ['/store']

// Routes that require admin role
const ADMIN_REQUIRED_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('[Middleware] Checking:', pathname)

  // Check if the current path requires authentication
  const requiresAuth = AUTH_REQUIRED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // Check if the current path requires seller role
  const requiresSeller = SELLER_REQUIRED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // Check if the current path requires admin role
  const requiresAdmin = ADMIN_REQUIRED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  console.log('[Middleware] Requirements:', { requiresAuth, requiresSeller, requiresAdmin })

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  console.log('[Middleware] Token found:', !!token, 'Token length:', token?.length || 0)

  // If no auth token and route requires auth, redirect to login
  if (!token && (requiresAuth || requiresSeller || requiresAdmin)) {
    console.log('[Middleware] No token but auth required, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If token exists, allow access - actual auth verification happens in API routes/pages
  if (token) {
    console.log('[Middleware] Token present, allowing access - backend will verify')
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/store/:path*',
    '/orders',
    '/profile/:path*',
    '/cart/checkout',
  ],
}
