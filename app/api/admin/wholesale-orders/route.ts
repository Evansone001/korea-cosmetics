import { NextRequest, NextResponse } from 'next/server';
import { StorePurchase } from '@/lib/services/wholesale';
import { validateApiKey, requireRole, checkRateLimit, logAuditEvent } from '@/lib/security';
import { demoStorePurchases, getDemoCRMProducts } from '@/lib/demo/wholesaleData';

// GET - Admin fetches all wholesale orders from backend
export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    
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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Build backend URL with query params
    const backendUrl = new URL('http://localhost:5000/api/admin/wholesale-orders');
    if (status) backendUrl.searchParams.append('status', status);
    if (search) backendUrl.searchParams.append('search', search);
    backendUrl.searchParams.append('limit', limit);
    backendUrl.searchParams.append('offset', offset);

    // Forward auth token to backend as Bearer token
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['authorization'] = `Bearer ${authToken}`;
    }

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
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Admin approves/rejects order or updates status
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { orderId, action, trackingNumber } = body;

    // Build backend URL
    const backendUrl = new URL('http://localhost:5000/api/admin/wholesale-orders');

    // Forward auth token to backend as Bearer token
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId, action, trackingNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Order action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

