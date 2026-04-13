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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query = searchParams.get('query');
    const sort_by = searchParams.get('sort_by');
    const sort_order = searchParams.get('sort_order');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Build backend URL with query params
    const backendUrl = new URL('http://localhost:5000/api/stores/admin/all');
    if (status) backendUrl.searchParams.append('status', status);
    if (query) backendUrl.searchParams.append('query', query);
    if (sort_by) backendUrl.searchParams.append('sort_by', sort_by);
    if (sort_order) backendUrl.searchParams.append('sort_order', sort_order);
    backendUrl.searchParams.append('limit', limit);
    backendUrl.searchParams.append('offset', offset);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch store performance error:', error);
    return NextResponse.json({ error: 'Failed to fetch store performance' }, { status: 500 });
  }
}
