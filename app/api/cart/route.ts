import { NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-in-production';

interface CartItem {
  productId: string;
  quantity: number;
}

// In-memory cart storage (in production, use Redis or database)
const cartStore = new Map<string, CartItem[]>();

// Verify JWT and get user ID
function getUserIdFromToken(request: Request): string | null {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) return null;
    
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload.sub;
  } catch {
    return null;
  }
}

// GET - Fetch user's cart
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const cart = cartStore.get(userId) || [];
    
    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Update cart (replace entire cart)
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { cart } = await request.json();
    
    if (!Array.isArray(cart)) {
      return NextResponse.json(
        { error: 'Invalid cart data' },
        { status: 400 }
      );
    }
    
    // Validate cart items
    const validCart = cart.filter(item => 
      item.productId && 
      typeof item.productId === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
    
    cartStore.set(userId, validCart);
    
    return NextResponse.json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    cartStore.delete(userId);
    
    return NextResponse.json({
      success: true,
      cart: [],
    });
  } catch (error) {
    console.error('Cart clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
