import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request
    const cookie = request.headers.get('cookie');
    let authToken = '';
    
    // Extract JWT from cookie
    if (cookie) {
      const authMatch = cookie.match(/auth-token=([^;]+)/);
      if (authMatch) {
        authToken = authMatch[1];
      }
    }

    // Forward auth token to backend as Bearer token
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch('http://localhost:5000/api/admin/metrics/platform', {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch platform metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch platform metrics' }, { status: 500 });
  }
}
