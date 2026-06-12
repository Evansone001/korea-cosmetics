import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie');
    const authToken = cookie?.match(/auth-token=([^;]+)/)?.[1];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/admin/metrics/stores/health-scores`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Admin Health Scores API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch health scores' }, { status: 500 });
  }
}
