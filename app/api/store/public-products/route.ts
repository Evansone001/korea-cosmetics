import { NextRequest, NextResponse } from 'next/server';

interface PublicProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  manufacturer: string;
  images: string[];
  stock: number;
  inStock: boolean;
  isFromInventory: boolean;
}

// Mock data - in production this would query the database
const storePublicProducts = new Map<string, PublicProduct[]>();

// Seed some demo data for "happy-shop"
storePublicProducts.set('happy-shop', [
  {
    id: 'pub_1',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    description: 'Lightweight essence with 96% snail mucin extract for intense hydration',
    price: 35.00,
    mrp: 42.00,
    category: 'Skincare',
    manufacturer: 'COSRX',
    images: [],
    stock: 15,
    inStock: true,
    isFromInventory: true,
  },
  {
    id: 'pub_2',
    name: 'Beauty of Joseon Dynasty Cream',
    description: 'Luxurious cream with rice bran water and ginseng extract',
    price: 45.00,
    mrp: 52.00,
    category: 'Skincare',
    manufacturer: 'Beauty of Joseon',
    images: [],
    stock: 8,
    inStock: true,
    isFromInventory: true,
  },
  {
    id: 'pub_3',
    name: 'COSRX Acne Pimple Master Patch',
    description: 'Hydrocolloid patches for pimple care',
    price: 9.00,
    mrp: 12.00,
    category: 'Skincare',
    manufacturer: 'COSRX',
    images: [],
    stock: 25,
    inStock: true,
    isFromInventory: true,
  },
]);

// GET - Fetch public products for a store
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'happy-shop';
    const products = storePublicProducts.get(storeId) || [];

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Add/update public product (called by inventory sync)
export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'store_1';
    const body = await request.json();
    const { product } = body;

    if (!product) {
      return NextResponse.json({ error: 'Product data required' }, { status: 400 });
    }

    const products = storePublicProducts.get(storeId) || [];
    const existingIndex = products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...product };
    } else {
      products.push(product);
    }

    storePublicProducts.set(storeId, products);

    return NextResponse.json({
      success: true,
      message: 'Product saved',
      product,
    });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

// PUT - Update stock when customer purchases
export async function PUT(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'store_1';
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing productId or quantity' }, { status: 400 });
    }

    const products = storePublicProducts.get(storeId) || [];
    const product = products.find(p => p.id === productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    product.stock -= quantity;
    product.inStock = product.stock > 0;

    return NextResponse.json({
      success: true,
      message: 'Stock updated',
      remainingStock: product.stock,
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
