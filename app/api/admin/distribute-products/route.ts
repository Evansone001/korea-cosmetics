import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Admin distributes products to a store
export async function POST(request: Request) {
  try {
    const { productIds, storeId, pricing } = await request.json();

    if (!productIds || !storeId) {
      return NextResponse.json(
        { error: 'Missing productIds or storeId' },
        { status: 400 }
      );
    }

    const distributed = [];
    const failed = [];

    for (const productId of productIds) {
      try {
        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          failed.push({ productId, error: 'Product not found' });
          continue;
        }

        // Create store product entry with optional markup
        const storeProduct = await prisma.storeProduct.create({
          data: {
            productId,
            storeId,
            // If admin sets a markup, apply it to base price
            price: pricing?.markup 
              ? product.price * (1 + pricing.markup / 100)
              : product.price,
            inStock: true,
            status: 'active',
          },
        });

        distributed.push(storeProduct);
      } catch (error) {
        failed.push({ productId, error: String(error) });
      }
    }

    return NextResponse.json({
      success: failed.length === 0,
      message: `Distributed ${distributed.length} products to store`,
      distributed,
      failed,
    });
  } catch (error) {
    console.error('Distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to distribute products' },
      { status: 500 }
    );
  }
}

// GET - Get products available to a store (from admin catalog)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Missing storeId' },
        { status: 400 }
      );
    }

    // Get products distributed to this store
    const storeProducts = await prisma.storeProduct.findMany({
      where: { storeId },
      include: {
        product: true,
      },
    });

    // Get all admin-supplied products (where storeId is null or admin's ID)
    const adminProducts = await prisma.product.findMany({
      where: {
        // Admin-supplied products have storeId as null or a specific admin store ID
        storeId: { equals: null },
      },
    });

    return NextResponse.json({
      storeProducts,
      availableFromAdmin: adminProducts,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
