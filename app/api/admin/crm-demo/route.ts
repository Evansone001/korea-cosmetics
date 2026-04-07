import { NextResponse } from 'next/server';
import { getDemoCRMProducts, simulateCRMSync } from '@/lib/demo/wholesaleData';

// GET - Fetch demo products from simulated CRM
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const category = searchParams.get('category') || undefined;

    let products = getDemoCRMProducts();

    // Filter by manufacturer
    if (manufacturer) {
      products = products.filter(p => p.manufacturer === manufacturer);
    }

    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }

    return NextResponse.json({
      success: true,
      mode: 'demo',
      message: 'Demo data from simulated CRM',
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Demo CRM fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo products' },
      { status: 500 }
    );
  }
}

// POST - Import demo products into admin catalog
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds } = body;

    const allProducts = getDemoCRMProducts();
    
    // Filter products if specific IDs provided
    const productsToImport = productIds && productIds.length > 0
      ? allProducts.filter(p => productIds.includes(p.id))
      : allProducts;

    // Simulate import process
    const result = simulateCRMSync();

    return NextResponse.json({
      success: true,
      mode: 'demo',
      message: `Demo: Imported ${productsToImport.length} products to admin catalog`,
      imported: productsToImport.length,
      products: productsToImport,
    });
  } catch (error) {
    console.error('Demo CRM import error:', error);
    return NextResponse.json(
      { error: 'Failed to import demo products' },
      { status: 500 }
    );
  }
}
