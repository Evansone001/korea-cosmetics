import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const authMatch = cookieHeader.match(/auth-token=([^;]+)/);
    const authToken = authMatch?.[1];

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/reseller-applications/my-application`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Reseller Application API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reseller application' }, { status: 500 });
  }
}
