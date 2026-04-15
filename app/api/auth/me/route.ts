import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// GET - Get current user information
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const cookie = request.headers.get('cookie');
    const authToken = cookie?.match(/auth-token=([^;]+)/)?.[1];

    // Forward request to backend with Authorization header
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include', // Send cookies for authentication
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
