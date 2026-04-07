import { NextRequest, NextResponse } from 'next/server';
import { wholesaleService } from '@/lib/services/wholesale';
import { validateApiKey, requireRole, checkRateLimit, logAuditEvent } from '@/lib/security';
import { getDemoCRMProducts } from '@/lib/demo/wholesaleData';

// Use demo data for testing
const mockWholesaleProducts = getDemoCRMProducts();

const storeCarts = new Map<string, Array<{
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}>>();

// GET - Browse wholesale catalog (available to stores)
export async function GET(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`wholesale-catalog-${clientIp}`, 100, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Skip API key validation in development/demo mode
    // if (!validateApiKey(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const manufacturer = searchParams.get('manufacturer');
    const storeTier = searchParams.get('tier') || 'standard';

    // Filter products
    let products = mockWholesaleProducts.filter(p => p.availableStock > 0);

    if (category) {
      products = products.filter(p => p.category === category);
    }
    if (manufacturer) {
      products = products.filter(p => p.manufacturer === manufacturer);
    }

    // Calculate wholesale prices based on store tier
    const productsWithTierPricing = products.map(p => ({
      ...p,
      wholesalePrice: wholesaleService.calculateWholesalePrice(p.wholesalePrice, storeTier),
      profitMargin: Math.round((p.retailPrice - p.wholesalePrice) / p.retailPrice * 100),
    }));

    return NextResponse.json({
      success: true,
      count: productsWithTierPricing.length,
      products: productsWithTierPricing,
      tier: storeTier,
    });
  } catch (error) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

// POST - Add to wholesale cart
export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`wholesale-cart-${clientIp}`, 50, 60000);
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
    const { productId, quantity, tier = 'standard' } = body;

    // Validation
    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get product
    const product = mockWholesaleProducts.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check minimum order
    if (quantity < product.minOrderQuantity) {
      return NextResponse.json(
        { error: `Minimum order is ${product.minOrderQuantity} ${product.unit}s` },
        { status: 400 }
      );
    }

    // Check stock
    if (quantity > product.availableStock) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    const wholesalePrice = wholesaleService.calculateWholesalePrice(
      product.wholesalePrice,
      tier
    );

    // Add to cart
    const cart = storeCarts.get(storeId) || [];
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * wholesalePrice;
    } else {
      cart.push({
        productId,
        productName: product.name,
        quantity,
        unitPrice: wholesalePrice,
        totalPrice: wholesalePrice * quantity,
      });
    }

    storeCarts.set(storeId, cart);

    // Calculate cart totals
    const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    await logAuditEvent({
      action: 'WHOLESALE_CART_ADD',
      userId: storeId,
      userRole: 'store',
      resourceType: 'wholesale-cart',
      resourceId: productId,
      details: { quantity, tier },
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Added to cart',
      cart: {
        items: cart,
        itemCount,
        total: cartTotal,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}
