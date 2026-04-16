import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('[Mock Me API] Mock /api/auth/me request');

  // Mock user data
  const mockUser = {
    id: 'mock-user-id-123',
    email: 'mockuser@example.com',
    name: 'Mock User',
    role: 'customer',
    image: null,
  };

  return NextResponse.json({ user: mockUser });
}
