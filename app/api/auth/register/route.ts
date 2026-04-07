import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';

// POST - Register
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // In production: Check if email exists, hash password, save to DB
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'customer' as const,
    };

    const token = await generateToken({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Allow non-secure in development
      sameSite: 'lax', // Changed from strict to allow redirects
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
