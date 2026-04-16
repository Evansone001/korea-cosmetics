import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  console.log('[Mock Login API] Mock login attempt:', { email, passwordLength: password?.length });

  // Mock user data
  const mockUser = {
    id: 'mock-user-id-123',
    email: email,
    name: 'Mock User',
    role: email.includes('admin') ? 'admin' : 'customer',
    image: null,
  };

  // Mock access token (not a real JWT, just for testing)
  const mockToken = 'mock-access-token-' + Date.now();

  // Mock refresh token
  const mockRefreshToken = 'mock-refresh-token-' + Date.now();

  const response = NextResponse.json({
    user: mockUser,
    access_token: mockToken,
    refresh_token: mockRefreshToken,
  });

  // Set mock cookies
  const isProduction = process.env.NODE_ENV === 'production';
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  response.cookies.set('auth-token', mockToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires,
    path: '/',
  });

  response.cookies.set('refresh-token', mockRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires,
    path: '/',
  });

  console.log('[Mock Login API] Mock login successful');
  return response;
}
