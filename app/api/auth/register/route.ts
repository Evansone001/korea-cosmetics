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
        name: user.name,
        role: user.role,
        email_verified: user.email_verified,
        auth_provider: user.auth_provider,
        last_login_method: user.last_login_method,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
