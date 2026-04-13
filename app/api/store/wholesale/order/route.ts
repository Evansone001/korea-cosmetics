import { NextRequest, NextResponse } from 'next/server';
import { StorePurchase } from '@/lib/services/wholesale';
import { validateApiKey, requireRole, checkRateLimit, logAuditEvent } from '@/lib/security';

// Mock data
const storeCarts = new Map<string, Array<{
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}>>();

const mockStorePurchases: StorePurchase[] = [];

// GET - View cart
export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkStore = requireRole('store');
    if (!checkStore(request)) {
      return NextResponse.json({ error: 'Store access required' }, { status: 403 });
    }

    const storeId = request.headers.get('X-User-Id') || 'unknown';
    const cart = storeCarts.get(storeId) || [];

    const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart: {
        items: cart,
        itemCount,
        total: cartTotal,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST - Place wholesale order
export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`wholesale-order-${clientIp}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (!validateApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkStore = requireRole('store');
    if (!checkStore(request)) {
      return NextResponse.json({ error: 'Store access required' }, { status: 403 });
    }

    const storeId = request.headers.get('X-User-Id') || 'unknown';
    const body = await request.json();
    const { shippingAddress, discountCode } = body;

    const cart = storeCarts.get(storeId);
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Apply discount if code provided
    let discount = 0;
    if (discountCode) {
      // Simple discount logic - 5% for WHOLESALE5
      if (discountCode === 'WHOLESALE5') {
        discount = subtotal * 0.05;
      } else if (discountCode === 'BULK10' && subtotal > 500) {
        discount = subtotal * 0.10;
      }
    }

    // Calculate tax (8%)
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
    const total = taxableAmount + tax;

    // Create purchase order
    const purchase: StorePurchase = {
      id: `wp_${Date.now()}_${storeId}`,
      storeId,
      storeName: '', // Would be populated from store profile
      items: cart.map(item => ({ ...item })),
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      tax,
      total: Math.round(total * 100) / 100,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: shippingAddress || {
        name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorePurchases.push(purchase);

    // Clear cart
    storeCarts.delete(storeId);

    await logAuditEvent({
      action: 'WHOLESALE_ORDER_PLACED',
      userId: storeId,
      userRole: 'store',
      resourceType: 'wholesale-order',
      resourceId: purchase.id,
      details: {
        itemCount: cart.length,
        total: purchase.total,
        discountCode,
      },
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: purchase,
      paymentInstructions: {
        method: 'bank_transfer',
        accountName: 'KoreaCosmetics Wholesale',
        accountNumber: '****1234',
        reference: purchase.id,
        amount: total,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Order placement error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkStore = requireRole('store');
    if (!checkStore(request)) {
      return NextResponse.json({ error: 'Store access required' }, { status: 403 });
    }

    const storeId = request.headers.get('X-User-Id') || 'unknown';
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const cart = storeCarts.get(storeId) || [];
    const updatedCart = cart.filter(item => item.productId !== productId);
    storeCarts.set(storeId, updatedCart);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
