import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// GET - List all users (admin only)
export async function GET(request: Request) {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    console.log('[Admin Users API] Token from cookie:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token in cookie' }, { status: 401 });
    }

    // Forward the request to Flask backend
    const url = new URL(request.url);
    const queryString = url.searchParams.toString();
    const backendUrl = `${FLASK_BACKEND_URL}/api/auth/admin/users${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from backend' },
      { status: 500 }
    );
  }
}
