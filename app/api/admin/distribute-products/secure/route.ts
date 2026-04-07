import { NextRequest, NextResponse } from 'next/server';
import {
  validateApiKey,
  requireRole,
  checkRateLimit,
  logAuditEvent,
  validateProductDistribution,
} from '@/lib/security';

// Mock data - replace with actual database
const mockStoreProducts: Array<{
  productId: string;
  storeId: string;
  price: number;
  inStock: boolean;
  status: string;
  distributedAt: string;
  distributedBy: string;
}> = [];

const mockProducts: Array<{
  id: string;
  name: string;
  price: number;
  storeId: string | null;
}> = [];

// POST - Admin distributes products to a store (Secure version)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`distribute-${clientIp}`, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate API key
    if (!validateApiKey(request)) {
      await logAuditEvent({
        action: 'UNAUTHORIZED_DISTRIBUTION_ATTEMPT',
        userId: 'unknown',
        userRole: 'unknown',
        resourceType: 'product-distribution',
        resourceId: 'post',
        details: { reason: 'Invalid API key' },
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const checkAdmin = requireRole('admin');
    if (!checkAdmin(request)) {
      await logAuditEvent({
        action: 'FORBIDDEN_DISTRIBUTION_ATTEMPT',
        userId: request.headers.get('X-User-Id') || 'unknown',
        userRole: request.headers.get('X-User-Role') || 'unknown',
        resourceType: 'product-distribution',
        resourceId: 'post',
        details: { reason: 'Non-admin attempted distribution' },
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateProductDistribution(body);
    if (!validation.valid) {
      await logAuditEvent({
        action: 'INVALID_DISTRIBUTION_REQUEST',
        userId: request.headers.get('X-User-Id') || 'unknown',
        userRole: 'admin',
        resourceType: 'product-distribution',
        resourceId: 'validation-failed',
        details: { errors: validation.errors },
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { productIds, storeId, pricing } = validation.sanitized as {
      productIds: string[];
      storeId: string;
      pricing?: { markup?: number };
    };

    const userId = request.headers.get('X-User-Id') || 'unknown';

    const distributed: typeof mockStoreProducts = [];
    const failed: Array<{ productId: string; error: string }> = [];

    for (const productId of productIds) {
      try {
        // Check if product exists
        const product = mockProducts.find(p => p.id === productId && p.storeId === null);

        if (!product) {
          failed.push({ productId, error: 'Product not found or not available' });
          continue;
        }

        // Check if already distributed to this store
        const existing = mockStoreProducts.find(
          sp => sp.productId === productId && sp.storeId === storeId
        );

        if (existing) {
          failed.push({ productId, error: 'Already distributed to this store' });
          continue;
        }

        // Calculate price with markup
        const basePrice = product.price;
        const markup = pricing?.markup || 20; // Default 20%
        const finalPrice = basePrice * (1 + markup / 100);

        // Create store product entry
        const storeProduct = {
          productId,
          storeId,
          price: finalPrice,
          inStock: true,
          status: 'active',
          distributedAt: new Date().toISOString(),
          distributedBy: userId,
        };

        mockStoreProducts.push(storeProduct);
        distributed.push(storeProduct);
      } catch (error) {
        failed.push({ productId, error: String(error) });
      }
    }

    // Log the distribution
    await logAuditEvent({
      action: 'PRODUCTS_DISTRIBUTED',
      userId,
      userRole: 'admin',
      resourceType: 'product-distribution',
      resourceId: storeId,
      details: {
        distributedCount: distributed.length,
        failedCount: failed.length,
        productIds,
        pricing,
      },
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: failed.length === 0,
      message: `Distributed ${distributed.length} products to store`,
      distributed,
      failed,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error('Distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to distribute products' },
      { status: 500 }
    );
  }
}

// GET - Get distribution history (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`distribution-history-${clientIp}`, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const checkAdmin = requireRole('admin');
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    let distributions = mockStoreProducts;
    if (storeId) {
      distributions = mockStoreProducts.filter(d => d.storeId === storeId);
    }

    return NextResponse.json({
      count: distributions.length,
      distributions,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error('Fetch distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch distribution history' },
      { status: 500 }
    );
  }
}
