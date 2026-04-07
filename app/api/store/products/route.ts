import { NextResponse } from 'next/server';

// Store product interface for manage-product page
interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  sold: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  rating: { user: { name: string }; rating: number; review: string }[];
  createdAt: string;
}

// Mock store products data
let mockStoreProducts: StoreProduct[] = [
  {
    id: 'prod_1',
    name: 'Snail Mucin Essence',
    description: 'Hydrating Korean skincare essence',
    price: 24.99,
    mrp: 35.00,
    category: 'Skincare',
    brand: 'COSRX',
    images: ['/assets/placeholder.png'],
    stock: 50,
    sold: 12,
    rating: [{ user: { name: 'User 1' }, rating: 5, review: 'Great product!' }],
    createdAt: '2026-01-01',
    status: 'active'
  },
  {
    id: 'prod_2',
    name: 'Vitamin C Serum',
    description: 'Brightening serum for glowing skin',
    price: 19.99,
    mrp: 29.99,
    category: 'Skincare',
    brand: 'Some By Mi',
    images: ['/assets/placeholder.png'],
    stock: 0,
    sold: 8,
    rating: [{ user: { name: 'User 2' }, rating: 4, review: 'Good results' }],
    createdAt: '2026-01-15',
    status: 'out_of_stock'
  },
  {
    id: 'prod_3',
    name: 'Hyaluronic Acid Toner',
    description: 'Deep hydration toner',
    price: 15.99,
    mrp: 22.00,
    category: 'Skincare',
    brand: 'Isntree',
    images: ['/assets/placeholder.png'],
    stock: 30,
    sold: 25,
    rating: [{ user: { name: 'User 3' }, rating: 5, review: 'Love it!' }],
    createdAt: '2026-02-01',
    status: 'inactive'
  }
];

// GET - Fetch store products
export async function GET() {
  try {
    // In production, filter by storeId from JWT token
    return NextResponse.json({
      success: true,
      products: mockStoreProducts
    });
  } catch (error) {
    console.error('Fetch store products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
