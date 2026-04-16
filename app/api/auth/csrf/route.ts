import { NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// GET - Get CSRF token
export async function GET() {
  try {
    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get CSRF token' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('CSRF token error:', error);
    return NextResponse.json({ error: 'Failed to get CSRF token' }, { status: 500 });
  }
}
