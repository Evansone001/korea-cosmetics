import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-in-production'

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = ['/orders', '/profile', '/cart/checkout']

// Routes that require seller role
const SELLER_REQUIRED_ROUTES = ['/store']

// Routes that require admin role
const ADMIN_REQUIRED_ROUTES = ['/admin']

// Base64URL decode (Edge Runtime compatible)
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return atob(padded)
}

// Create HMAC signature using Web Crypto API (Edge compatible)
async function createHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  
  // Convert to base64url
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Decode and verify JWT token
async function verifyToken(token: string): Promise<{ sub: string; email: string; role: string } | null> {
  try {
    const [header, body, signature] = token.split('.')
    
    if (!header || !body || !signature) return null
    
    const expectedSignature = await createHmacSignature(`${header}.${body}`, JWT_SECRET)
    
    if (signature !== expectedSignature) return null
    
    const payload = JSON.parse(base64UrlDecode(body))
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

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
  console.log('[Middleware] Token found:', !!token)

  // If no auth token and route requires auth, redirect to login
  if (!token && (requiresAuth || requiresSeller || requiresAdmin)) {
    console.log('[Middleware] No token but auth required, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token and check roles
  if (token) {
    const payload = await verifyToken(token)
    console.log('[Middleware] Verify result:', payload ? { role: payload.role } : 'null')
    
    if (!payload) {
      // Invalid or expired token - clear it and redirect
      if (requiresAuth || requiresSeller || requiresAdmin) {
        console.log('[Middleware] Invalid token, redirecting to login')
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.set('auth-token', '', { maxAge: 0 })
        return response
      }
    } else {
      // Check role requirements
      if (requiresAdmin && payload.role !== 'admin') {
        console.log('[Middleware] Admin required but role is:', payload.role)
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      if (requiresSeller && !['admin', 'seller'].includes(payload.role)) {
        console.log('[Middleware] Seller required but role is:', payload.role)
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      console.log('[Middleware] Access granted')
    }
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
