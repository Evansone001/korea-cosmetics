import { NextRequest, NextResponse } from 'next/server';
import { StorePurchase } from '@/lib/services/wholesale';
import { validateApiKey, requireRole, checkRateLimit, logAuditEvent } from '@/lib/security';
import { demoStorePurchases, getDemoCRMProducts } from '@/lib/demo/wholesaleData';

// Mock data storage
const wholesaleOrders: StorePurchase[] = [...demoStorePurchases];
const products = getDemoCRMProducts();

// GET - Admin fetches all wholesale orders
export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Validation (bypass for demo)
    // if (!validateApiKey(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const storeId = searchParams.get('storeId');

    let orders = wholesaleOrders;

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (storeId) {
      orders = orders.filter(o => o.storeId === storeId);
    }

    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
      summary: {
        total: wholesaleOrders.length,
        pending: wholesaleOrders.filter(o => o.status === 'pending').length,
        confirmed: wholesaleOrders.filter(o => o.status === 'confirmed').length,
        shipped: wholesaleOrders.filter(o => o.status === 'shipped').length,
        delivered: wholesaleOrders.filter(o => o.status === 'delivered').length,
        totalRevenue: wholesaleOrders.reduce((sum, o) => sum + o.total, 0),
      },
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Admin approves/rejects order or updates status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, trackingNumber, notes } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing orderId or action' }, { status: 400 });
    }

    const order = wholesaleOrders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'approve':
        // Check stock availability
        const stockCheck = checkStockAvailability(order);
        if (!stockCheck.available) {
          return NextResponse.json({
            error: 'Insufficient stock',
            details: stockCheck.missing,
          }, { status: 400 });
        }

        // Reserve stock
        reserveStock(order);

        order.status = 'confirmed';
        order.paymentStatus = 'pending';
        order.updatedAt = now;

        await logAuditEvent({
          action: 'WHOLESALE_ORDER_APPROVED',
          userId: 'admin',
          userRole: 'admin',
          resourceType: 'wholesale-order',
          resourceId: orderId,
          details: { storeId: order.storeId, total: order.total },
        });

        return NextResponse.json({
          success: true,
          message: 'Order approved successfully',
          order,
          invoice: generateInvoice(order),
        });

      case 'reject':
        order.status = 'cancelled';
        order.updatedAt = now;

        await logAuditEvent({
          action: 'WHOLESALE_ORDER_REJECTED',
          userId: 'admin',
          userRole: 'admin',
          resourceType: 'wholesale-order',
          resourceId: orderId,
          details: { reason: notes || 'No reason provided' },
        });

        return NextResponse.json({
          success: true,
          message: 'Order rejected',
          order,
        });

      case 'ship':
        if (!trackingNumber) {
          return NextResponse.json({ error: 'Tracking number required' }, { status: 400 });
        }

        order.status = 'shipped';
        order.updatedAt = now;
        // Add tracking info
        (order as unknown as Record<string, unknown>).trackingNumber = trackingNumber;

        await logAuditEvent({
          action: 'WHOLESALE_ORDER_SHIPPED',
          userId: 'admin',
          userRole: 'admin',
          resourceType: 'wholesale-order',
          resourceId: orderId,
          details: { trackingNumber },
        });

        return NextResponse.json({
          success: true,
          message: 'Order marked as shipped',
          order,
        });

      case 'deliver':
        order.status = 'delivered';
        order.updatedAt = now;

        await logAuditEvent({
          action: 'WHOLESALE_ORDER_DELIVERED',
          userId: 'admin',
          userRole: 'admin',
          resourceType: 'wholesale-order',
          resourceId: orderId,
        });

        return NextResponse.json({
          success: true,
          message: 'Order marked as delivered',
          order,
        });

      case 'mark-paid':
        order.paymentStatus = 'paid';
        order.updatedAt = now;

        await logAuditEvent({
          action: 'WHOLESALE_PAYMENT_RECEIVED',
          userId: 'admin',
          userRole: 'admin',
          resourceType: 'wholesale-order',
          resourceId: orderId,
          details: { amount: order.total },
        });

        return NextResponse.json({
          success: true,
          message: 'Payment marked as received',
          order,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Order action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

// Helper functions
function checkStockAvailability(order: StorePurchase): { available: boolean; missing: Array<{ productId: string; requested: number; available: number }> } {
  const missing: Array<{ productId: string; requested: number; available: number }> = [];

  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.availableStock < item.quantity) {
      missing.push({
        productId: item.productId,
        requested: item.quantity,
        available: product?.availableStock || 0,
      });
    }
  }

  return {
    available: missing.length === 0,
    missing,
  };
}

function reserveStock(order: StorePurchase): void {
  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.availableStock -= item.quantity;
    }
  }
}

function generateInvoice(order: StorePurchase): {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: {
    name: string;
    address: string;
    phone: string;
  };
  items: typeof order.items;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentInstructions: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    reference: string;
  };
} {
  const invoiceNumber = `INV-W-${order.id.split('_')[2]}`;
  const date = new Date().toISOString();
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    invoiceNumber,
    date,
    dueDate,
    billTo: {
      name: order.shippingAddress.name,
      address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`,
      phone: order.shippingAddress.phone,
    },
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    tax: order.tax,
    total: order.total,
    paymentInstructions: {
      bankName: 'Equity Bank Kenya',
      accountName: 'KoreaBeauty Wholesale Ltd',
      accountNumber: '1234567890',
      swiftCode: 'EQBLKENA',
      reference: invoiceNumber,
    },
  };
}
