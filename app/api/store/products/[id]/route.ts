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

// PATCH - Update product status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const productIndex = mockStoreProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product status
    mockStoreProducts[productIndex] = {
      ...mockStoreProducts[productIndex],
      status
    };

    return NextResponse.json({
      success: true,
      message: 'Product status updated',
      product: mockStoreProducts[productIndex]
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Remove product from store
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productIndex = mockStoreProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Remove the product
    mockStoreProducts.splice(productIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Product removed from store'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to remove product' },
      { status: 500 }
    );
  }
}
