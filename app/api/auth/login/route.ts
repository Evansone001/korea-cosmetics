import { NextResponse } from 'next/server';
import { logUserAction } from '@/lib/services/userActionLog';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';
const USE_MOCK_DATA = process.env.USE_MOCK_AUTH === 'true';

// POST - Login
export async function POST(request: Request) {
  try {
    const { email: rawEmail, password: rawPassword } = await request.json();
    const email = rawEmail?.trim().toLowerCase();
    const password = rawPassword?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }


    // Use mock data if enabled or if backend is unavailable
    if (USE_MOCK_DATA) {
      console.log('[Login API] Using mock data for login');

      const mockUser = {
        id: 'mock-user-id-123',
        email: email,
        name: 'Mock User',
        role: email.includes('admin') ? 'admin' : email.includes('seller') ? 'seller' : 'customer',
        image: null,
      };

      const mockToken = 'mock-access-token-' + Date.now();
      const mockRefreshToken = 'mock-refresh-token-' + Date.now();

      const response = NextResponse.json({
        user: mockUser,
        access_token: mockToken,
        refresh_token: mockRefreshToken,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      response.cookies.set('auth-token', mockToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        expires,
        path: '/',
      });

      response.cookies.set('refresh-token', mockRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        expires,
        path: '/',
      });

      return response;
    }

    // Real backend login
    const flaskResponse = await fetch(`${FLASK_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const flaskData = await flaskResponse.json();

    if (!flaskResponse.ok) {
      console.log('[Login API] Flask login failed:', flaskData);
      return NextResponse.json(
        { error: flaskData.error || 'Login failed' },
        { status: flaskResponse.status }
      );
    }

    const user = flaskData.user;
    const token = flaskData.access_token;
    const refreshToken = flaskData.refresh_token;

    console.log('[Login API] Flask login successful for role:', user.role);

    // Log successful login
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    logUserAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'LOGIN',
      ipAddress: ip,
      userAgent: userAgent,
    }).catch(err => console.error('Failed to log login action:', err));

    // Create response with user data 
    const response = NextResponse.json({
      success: true,
      message: flaskData.message || 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        email_verified: user.email_verified,
        auth_provider: user.auth_provider,
        last_login_method: user.last_login_method,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      access_token: token,
    });

    // Set secure HTTP-only cookie with Flask token
    console.log('[Login API] Setting cookie, token length:', token?.length);
    // Calculate expiration: 30 days from now (matching Flask JWT_ACCESS_TOKEN_EXPIRES)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Detect HTTPS from request headers for proper secure cookie flag
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const isSecure = protocol === 'https';
    const cookieDomain = process.env.COOKIE_DOMAIN;
    
    console.log('[Login API] Cookie config:', {
      protocol,
      isSecure,
      cookieDomain: cookieDomain || 'none',
      nodeEnv: process.env.NODE_ENV,
      hasToken: !!token,
    });
    
    const cookieOptions: any = {
      httpOnly: true,
      secure: isSecure, // TRUE when served over HTTPS
      sameSite: 'lax',
      expires: expires,
      path: '/',
    };
    // Only set domain if configured in environment
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }
    response.cookies.set('auth-token', token, cookieOptions);

    // Set refresh token cookie if provided
    if (refreshToken) {
      const refreshCookieOptions: any = {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        expires: expires,
        path: '/',
      };
      if (cookieDomain) {
        refreshCookieOptions.domain = cookieDomain;
      }
      response.cookies.set('refresh-token', refreshToken, refreshCookieOptions);
    }

    console.log('[Login API] Cookie set, secure:', isSecure, 'domain:', cookieOptions.domain || 'none');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  // Base secure flag on NODE_ENV, not backend URL
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = process.env.COOKIE_DOMAIN;
  const cookieOptions: any = {
    httpOnly: true,
    secure: isProduction, // MUST be true in production HTTPS
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  };
  // Only set domain if configured in environment
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }
  response.cookies.set('auth-token', '', cookieOptions);
  response.cookies.set('refresh-token', '', cookieOptions);

  return response;
}
