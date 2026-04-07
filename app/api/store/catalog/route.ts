import { NextResponse } from 'next/server';

interface StoreProduct {
  productId: string;
  storeId: string;
}

interface Product {
  id: string;
  storeId: string | null;
  price: number;
}

// Mock data for now - replace with actual database queries
const mockStoreProducts: StoreProduct[] = [];

const mockProducts = [
  {
    id: 'kb_001',
    name: 'Advanced Snail 96 Mucin Power Essence',
    description: 'Lightweight essence with 96% snail secretion filtrate for deep hydration and repair',
    price: 24.99,
    mrp: 32.00,
    category: 'Skincare',
    manufacturer: 'COSRX',
    brand: 'COSRX',
    images: ['/assets/placeholder.png'],
    stock: 100,
    origin: 'South Korea',
    storeId: null
  },
  {
    id: 'kb_002',
    name: 'Green Tea Seed Serum',
    description: 'Hydrating serum with Jeju green tea extract for moisture barrier',
    price: 28.50,
    mrp: 35.00,
    category: 'Skincare',
    manufacturer: 'Innisfree',
    brand: 'Innisfree',
    images: ['/assets/placeholder.png'],
    stock: 75,
    origin: 'South Korea',
    storeId: null
  },
  {
    id: 'kb_003',
    name: 'AHA BHA PHA 30 Days Miracle Toner',
    description: 'Exfoliating toner with tea tree for acne-prone skin',
    price: 18.99,
    mrp: 25.00,
    category: 'Skincare',
    manufacturer: 'Some By Mi',
    brand: 'Some By Mi',
    images: ['/assets/placeholder.png'],
    stock: 60,
    origin: 'South Korea',
    storeId: null
  },
  {
    id: 'kb_004',
    name: 'Relief Sun SPF50+ PA++++',
    description: 'Rice probiotics sunscreen with broad spectrum protection',
    price: 22.00,
    mrp: 28.00,
    category: 'Skincare',
    manufacturer: 'Beauty of Joseon',
    brand: 'Beauty of Joseon',
    images: ['/assets/placeholder.png'],
    stock: 80,
    origin: 'South Korea',
    storeId: null
  },
  {
    id: 'kb_005',
    name: 'Lip Sleeping Mask Berry',
    description: 'Overnight lip mask with Vitamin C and berry mix complex',
    price: 19.50,
    mrp: 24.00,
    category: 'Makeup',
    manufacturer: 'Laneige',
    brand: 'Laneige',
    images: ['/assets/placeholder.png'],
    stock: 120,
    origin: 'South Korea',
    storeId: null
  },
  {
    id: 'kb_006',
    name: 'Jeju Orchid Eye Cream',
    description: 'Anti-aging eye cream with orchid extract',
    price: 32.00,
    mrp: 42.00,
    category: 'Skincare',
    manufacturer: 'Innisfree',
    brand: 'Innisfree',
    images: ['/assets/placeholder.png'],
    stock: 45,
    origin: 'South Korea',
    storeId: null
  }
];

// GET - Fetch available products from admin catalog
export async function GET() {
  try {
    const storeId = 'store_1';

    const storeProducts = mockStoreProducts.filter((sp) => sp.storeId === storeId);
    const addedProductIds = storeProducts.map((sp) => sp.productId);

    const availableProducts = mockProducts.filter((p) => 
      p.storeId === null && !addedProductIds.includes(p.id)
    );

    const allAdminProducts = mockProducts.filter((p) => p.storeId === null);

    const productsWithStatus = allAdminProducts.map((product) => ({
      ...product,
      alreadyAdded: addedProductIds.includes(product.id),
    }));

    return NextResponse.json({
      products: productsWithStatus,
      total: productsWithStatus.length,
      available: availableProducts.length,
    });
  } catch (error) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}

// POST - Add a product from admin catalog to store
export async function POST(request: Request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      );
    }

    const storeId = 'store_1';
    const product = mockProducts.find((p) => p.id === productId && p.storeId === null);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    const existing = mockStoreProducts.find(
      (sp) => sp.productId === productId && sp.storeId === storeId
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Product already added to your store' },
        { status: 400 }
      );
    }

    const storeProduct = { productId, storeId };
    mockStoreProducts.push(storeProduct);

    return NextResponse.json({
      success: true,
      message: 'Product added to your store',
      storeProduct,
    });
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    );
  }
}
