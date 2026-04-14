import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// GET - Get current user information
export async function GET(request: NextRequest) {
  try {
    // Get auth token from request
    const cookie = request.headers.get('cookie');

    // Forward request to backend with cookies
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward the cookie header if present
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Ensure user object has name field
    if (data.user && !data.user.name && (data.user.first_name || data.user.last_name)) {
      data.user.name = `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
  }
}
