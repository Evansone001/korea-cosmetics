import { NextResponse } from 'next/server';
import { crmProductSync, CRMProduct } from '@/lib/services/crmProductSync';
import { crmService } from '@/lib/services/crmIntegration';

// GET - Fetch products from external CRM
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const category = searchParams.get('category') || undefined;
    const since = searchParams.get('since') || undefined;

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
      since,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('CRM fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from CRM' },
      { status: 500 }
    );
  }
}

// POST - Import products from CRM into KoreaCosmetics' Hub
export async function POST(request: Request) {
  try {
    const { productIds, autoDistribute } = await request.json();

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
    
    if (productIds && productIds.length > 0) {
      // Fetch specific products
      const allProducts = await crmProductSync.fetchProductsFromCRM();
      productsToSync = allProducts.filter(p => productIds.includes(p.id));
    } else {
      // Fetch all available products
      productsToSync = await crmProductSync.fetchProductsFromCRM();
    }

    // Sync to KoreaCosmetics' Hub
    const result = await crmProductSync.syncProducts(productsToSync);

    return NextResponse.json({
      success: result.success,
      message: `Imported ${result.imported} new, updated ${result.updated} existing`,
      details: result,
    });
  } catch (error) {
    console.error('CRM import error:', error);
    return NextResponse.json(
      { error: 'Failed to import products from CRM' },
      { status: 500 }
    );
  }
}
