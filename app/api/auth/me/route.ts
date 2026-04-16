import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL =
  process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

const USE_MOCK_DATA = process.env.USE_MOCK_AUTH === 'true';

export async function GET(request: NextRequest) {
  if (USE_MOCK_DATA) {
    return NextResponse.json({
      user: {
        id: 'mock-user-id-123',
        email: 'mockuser@example.com',
        name: 'Mock User',
        role: 'customer',
        image: null,
      },
    });
  }

  try {
    const cookieHeader = request.headers.get('cookie') || '';

    // ✅ EXTRACT ONLY AUTH TOKEN (CRITICAL FIX)
    const authMatch = cookieHeader.match(/auth-token=([^;]+)/);
    const authToken = authMatch?.[1];

    if (!authToken) {
      console.log('[Auth Me API] No auth-token found in cookies');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth-token=${authToken}`, // ✅ CLEAN COOKIE ONLY
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    console.log('[Auth Me API] Backend response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    if (
      data.user &&
      !data.user.name &&
      (data.user.first_name || data.user.last_name)
    ) {
      data.user.name = `${data.user.first_name || ''} ${
        data.user.last_name || ''
      }`.trim();
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}