import { NextResponse } from 'next/server';

// GET - Fetch all products (from database or CRM)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';

    // Return empty array - products are managed in-memory via catalog page state
    const products: any[] = [];

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In production, save to database
    // For now, return success - product is managed client-side
    
    return NextResponse.json({
      success: true,
      message: 'Product created',
      product: body,
    });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
