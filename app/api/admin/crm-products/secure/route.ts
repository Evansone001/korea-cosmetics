import { NextRequest, NextResponse } from 'next/server';
import {
  validateApiKey,
  requireRole,
  checkRateLimit,
  logAuditEvent,
  validateProductDistribution,
  checkCors,
} from '@/lib/security';
import { crmProductSync, CRMProduct } from '@/lib/services/crmProductSync';
import { crmService } from '@/lib/services/crmIntegration';

// GET - Fetch products from external CRM (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Check CORS
    if (!checkCors(request)) {
      return NextResponse.json(
        { error: 'CORS policy violation' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`crm-products-${clientIp}`, 50, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate API key
    if (!validateApiKey(request)) {
      await logAuditEvent({
        action: 'UNAUTHORIZED_ACCESS',
        userId: 'unknown',
        userRole: 'unknown',
        resourceType: 'crm-products',
        resourceId: 'get',
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
        action: 'FORBIDDEN_ACCESS',
        userId: request.headers.get('X-User-Id') || 'unknown',
        userRole: request.headers.get('X-User-Role') || 'unknown',
        resourceType: 'crm-products',
        resourceId: 'get',
        details: { reason: 'Non-admin attempted access' },
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const category = searchParams.get('category') || undefined;

    const config = crmService.getConfig();
    if (!config?.enabled) {
      return NextResponse.json(
        { error: 'CRM integration not enabled' },
        { status: 400 }
      );
    }

    crmProductSync.setConfig(config);

    const products = await crmProductSync.fetchProductsFromCRM({
      manufacturer,
      category,
    });

    // Log successful access
    await logAuditEvent({
      action: 'CRM_PRODUCTS_FETCHED',
      userId: request.headers.get('X-User-Id') || 'unknown',
      userRole: 'admin',
      resourceType: 'crm-products',
      resourceId: 'list',
      details: { 
        count: products.length,
        manufacturer,
        category,
      },
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error('CRM fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from CRM' },
      { status: 500 }
    );
  }
}

// POST - Import products from CRM (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check CORS
    if (!checkCors(request)) {
      return NextResponse.json(
        { error: 'CORS policy violation' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`crm-import-${clientIp}`, 10, 60000);
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

    // Parse and validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate product IDs if provided
    if (body.productIds) {
      if (!Array.isArray(body.productIds)) {
        return NextResponse.json(
          { error: 'productIds must be an array' },
          { status: 400 }
        );
      }
      if (body.productIds.length > 100) {
        return NextResponse.json(
          { error: 'Cannot import more than 100 products at once' },
          { status: 400 }
        );
      }
    }

    const config = crmService.getConfig();
    if (!config?.enabled) {
      return NextResponse.json(
        { error: 'CRM integration not enabled' },
        { status: 400 }
      );
    }

    crmProductSync.setConfig(config);

    // Fetch all products or specific ones
    let productsToSync: CRMProduct[] = [];
    
    if (body.productIds && body.productIds.length > 0) {
      const allProducts = await crmProductSync.fetchProductsFromCRM();
      productsToSync = allProducts.filter(p => body.productIds.includes(p.id));
    } else {
      productsToSync = await crmProductSync.fetchProductsFromCRM();
    }

    // Sync to KoreaBeauty Hub
    const result = await crmProductSync.syncProducts(productsToSync);

    // Log the import
    await logAuditEvent({
      action: 'CRM_PRODUCTS_IMPORTED',
      userId: request.headers.get('X-User-Id') || 'unknown',
      userRole: 'admin',
      resourceType: 'crm-products',
      resourceId: 'import',
      details: { 
        imported: result.imported,
        updated: result.updated,
        failed: result.failed,
      },
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: result.success,
      message: `Imported ${result.imported} new, updated ${result.updated} existing`,
      details: result,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error('CRM import error:', error);
    return NextResponse.json(
      { error: 'Failed to import products from CRM' },
      { status: 500 }
    );
  }
}
