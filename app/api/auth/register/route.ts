import { NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// POST - Register
export async function POST(request: Request) {
  try {
    const { first_name, last_name, email, password, phone, role } = await request.json();

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Call Flask backend for registration
    const flaskResponse = await fetch(`${FLASK_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        first_name, 
        last_name, 
        email, 
        password, 
        phone, 
        role: role || 'customer' 
      }),
    });

    const flaskData = await flaskResponse.json();

    if (!flaskResponse.ok) {
      console.log('[Register API] Flask registration failed:', flaskData);
      return NextResponse.json(
        { error: flaskData.error || 'Registration failed' },
        { status: flaskResponse.status }
      );
    }

    const user = flaskData.user;
    const token = flaskData.access_token;
    const refreshToken = flaskData.refresh_token;

    // Create response with user data and token
    const response = NextResponse.json({
      success: true,
      message: flaskData.message || 'Registration successful',
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
    });

    // Set secure HTTP-only cookie with Flask token
    console.log('[Register API] Setting cookie, token length:', token?.length);
    // Calculate expiration: 30 days from now (matching Flask JWT_ACCESS_TOKEN_EXPIRES)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Detect HTTPS from request headers for proper secure cookie flag
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const isSecure = protocol === 'https';
    const cookieDomain = process.env.COOKIE_DOMAIN;
    
    console.log('[Register API] Cookie config:', {
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

    console.log('[Register API] Cookie set, secure:', isSecure, 'domain:', cookieOptions.domain || 'none');

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
