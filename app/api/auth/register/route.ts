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

    // Only use secure cookies if backend is HTTPS (not HTTP)
    const isHttpsBackend = FLASK_BACKEND_URL.startsWith('https://');
    // Only set domain for production, not localhost
    const isProduction = process.env.NODE_ENV === 'production' || FLASK_BACKEND_URL.includes('koreacosmetics.top');
    const cookieOptions: any = {
      httpOnly: true,
      secure: isHttpsBackend,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    };
    // Only set domain in production for cross-subdomain cookies
    if (isProduction) {
      cookieOptions.domain = '.koreacosmetics.top';
    }
    response.cookies.set('auth-token', token, cookieOptions);

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
