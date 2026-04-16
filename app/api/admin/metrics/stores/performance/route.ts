import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const cookie = request.headers.get('cookie');
    const authToken = cookie?.match(/auth-token=([^;]+)/)?.[1];

    console.log('[Admin Stores Performance API] Cookie from browser:', cookie ? 'present' : 'missing');
    console.log('[Admin Stores Performance API] Auth token:', authToken ? `${authToken.substring(0, 10)}...` : 'missing');

    // Forward request to backend with credentials to include cookies
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Cookie'] = `auth-token=${authToken}`;
      console.log('[Admin Stores Performance API] Forwarding cookie to backend');
    } else {
      console.log('[Admin Stores Performance API] No cookie to forward to backend');
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/admin/metrics/stores/performance`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    console.log('[Admin Stores Performance API] Backend response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch store performance metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch store performance metrics' }, { status: 500 });
  }
}
