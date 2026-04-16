import { NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// POST - Refresh access token
export async function POST(request: Request) {
  try {
    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Set new access token in cookie
    const newResponse = NextResponse.json({
      access_token: data.access_token,
    });

    // Forward the new access token as a cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN;
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: expires,
      path: '/',
    };
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }
    newResponse.cookies.set('auth-token', data.access_token, cookieOptions);

    return newResponse;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}
