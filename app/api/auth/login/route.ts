import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';
import { logUserAction, type UserAction } from '@/lib/services/userActionLog';

// JWT secret - in production, use a proper secret from env
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-in-production';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
}

// POST - Login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Demo authentication - replace with database lookup
    let user: User | null = null;

    if (email === 'admin@koreabeauty.com' && password === 'admin123') {
      user = {
        id: '1',
        email: 'admin@koreabeauty.com',
        name: 'Admin User',
        role: 'admin',
      };
    } else if (email === 'seller@koreabeauty.com' && password === 'seller123') {
      user = {
        id: '2',
        email: 'seller@koreabeauty.com',
        name: 'Seller User',
        role: 'seller',
      };
    } else if (email === 'customer@koreabeauty.com' && password === 'customer123') {
      user = {
        id: '3',
        email: 'customer@koreabeauty.com',
        name: 'John Doe',
        role: 'customer',
      };
    } else if (email && password) {
      // Auto-create customer for any valid-looking email
      user = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role: 'customer',
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await generateToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    console.log('[Login API] Generated token for role:', user.role);

    // Log successful login
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    logUserAction({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'LOGIN',
      ipAddress: ip,
      userAgent: userAgent,
    }).catch(err => console.error('Failed to log login action:', err));

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    console.log('[Login API] Setting cookie, token length:', token?.length);
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
    console.log('[Login API] Cookie set');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
