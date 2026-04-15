import { NextResponse } from 'next/server';
import { logUserAction, type UserAction } from '@/lib/services/userActionLog';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

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

    // Call Flask backend for authentication
    console.log('[Login API] Attempting login with Flask backend:', { email, passwordLength: password?.length });

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
    // Only use secure cookies if backend is HTTPS (not HTTP)
    const isHttpsBackend = FLASK_BACKEND_URL.startsWith('https://');
    // Only set domain for production, not localhost
    const isProduction = process.env.NODE_ENV === 'production' || FLASK_BACKEND_URL.includes('koreacosmetics.top');
    const cookieOptions: any = {
      httpOnly: true,
      secure: isHttpsBackend,
      sameSite: 'lax',
      expires: expires,
      path: '/',
    };
    // Only set domain in production for cross-subdomain cookies
    if (isProduction) {
      cookieOptions.domain = '.koreacosmetics.top';
    }
    response.cookies.set('auth-token', token, cookieOptions);
    console.log('[Login API] Cookie set, secure:', isHttpsBackend, 'domain:', cookieOptions.domain || 'none');

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
  // Only use secure cookies if backend is HTTPS (not HTTP)
  const isHttpsBackend = FLASK_BACKEND_URL.startsWith('https://');
  // Only set domain for production, not localhost
  const isProduction = process.env.NODE_ENV === 'production' || FLASK_BACKEND_URL.includes('koreacosmetics.top');
  const cookieOptions: any = {
    httpOnly: true,
    secure: isHttpsBackend,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  };
  // Only set domain in production for cross-subdomain cookies
  if (isProduction) {
    cookieOptions.domain = '.koreacosmetics.top';
  }
  response.cookies.set('auth-token', '', cookieOptions);

  return response;
}
