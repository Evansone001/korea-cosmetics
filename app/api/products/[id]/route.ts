import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL =
  process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract only auth-token
    const authMatch = cookieHeader.match(/auth-token=([^;]+)/);
    const authToken = authMatch?.[1];

    const res = await fetch(
      `${FLASK_BACKEND_URL}/api/products/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Cookie: `auth-token=${authToken}` } : {}),
        },
        cache: 'no-store',
      }
    );

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
