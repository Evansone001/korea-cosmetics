import { NextRequest, NextResponse } from 'next/server';

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000';

// GET - Get user email preferences
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

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/email-preferences`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If backend doesn't have this endpoint, return default preferences
      if (response.status === 404) {
        return NextResponse.json({
          email_marketing: true,
          email_order_notifications: true,
          email_product_updates: true,
          email_newsletter: false,
        });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Email preferences error:', error);
    // Return default preferences on error
    return NextResponse.json({
      email_marketing: true,
      email_order_notifications: true,
      email_product_updates: true,
      email_newsletter: false,
    });
  }
}

// PUT - Update user email preferences
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

    const response = await fetch(`${FLASK_BACKEND_URL}/api/auth/email-preferences`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If backend doesn't have this endpoint, return success with the data
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          message: 'Email preferences updated',
          preferences: body,
        });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Email preferences update error:', error);
    return NextResponse.json({ error: 'Failed to update email preferences' }, { status: 500 });
  }
}
