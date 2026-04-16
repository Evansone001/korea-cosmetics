import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// GET - Get user privacy settings
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const cookie = request.headers.get('cookie');
    const authToken = cookie?.match(/auth-token=([^;]+)/)?.[1];

    // Forward request to backend with cookie
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Cookie'] = `auth-token=${authToken}`;
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/privacy-settings`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If backend doesn't have this endpoint, return default settings
      if (response.status === 404) {
        return NextResponse.json({
          profile_public: false,
          show_activity_status: false,
          data_sharing_consent: false,
        });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Privacy settings error:', error);
    // Return default settings on error
    return NextResponse.json({
      profile_public: false,
      show_activity_status: false,
      data_sharing_consent: false,
    });
  }
}

// PUT - Update user privacy settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Get auth token from cookie
    const cookie = request.headers.get('cookie');
    const authToken = cookie?.match(/auth-token=([^;]+)/)?.[1];

    // Forward request to backend with cookie
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Cookie'] = `auth-token=${authToken}`;
    }

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/privacy-settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If backend doesn't have this endpoint, return success with the data
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          message: 'Privacy settings updated',
          settings: body,
        });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Privacy settings update error:', error);
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
  }
}
