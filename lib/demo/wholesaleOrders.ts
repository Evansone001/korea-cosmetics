// Generate additional dummy wholesale orders for testing

import { StorePurchase } from '@/lib/services/wholesale';

export const additionalDummyOrders: StorePurchase[] = [
  {
    id: 'wp_demo_002',
    storeId: 'store_2',
    storeName: 'Glow Beauty Store',
    items: [
      {
        productId: 'crm_innisfree_001',
        productName: 'Innisfree Green Tea Seed Serum',
        quantity: 15,
        unitPrice: 18.50,
        totalPrice: 277.50,
      },
      {
        productId: 'crm_laneige_001',
        productName: 'Laneige Water Sleeping Mask',
        quantity: 12,
        unitPrice: 19.00,
        totalPrice: 228.00,
      },
    ],
    subtotal: 505.50,
    discount: 25.28,
    tax: 38.42,
    total: 518.64,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: {
      name: 'Sarah Kimani',
      address: '456 Westlands Ave, Westlands',
      city: 'Nairobi',
      country: 'Kenya',
      phone: '+254723456789',
    },
    createdAt: '2026-04-02T09:30:00Z',
    updatedAt: '2026-04-02T09:30:00Z',
  },
  {
    id: 'wp_demo_003',
    storeId: 'store_1',
    storeName: 'Happy Shop',
    items: [
      {
        productId: 'crm_beauty_joseon_001',
        productName: 'Beauty of Joseon Dynasty Cream',
        quantity: 20,
        unitPrice: 20.00,
        totalPrice: 400.00,
      },
      {
        productId: 'crm_som_by_mi_001',
        productName: 'Some By Mi AHA-BHA-PHA Miracle Toner',
        quantity: 25,
        unitPrice: 14.00,
        totalPrice: 350.00,
      },
    ],
    subtotal: 750.00,
    discount: 37.50,
    tax: 57.00,
    total: 769.50,
    status: 'confirmed',
    paymentStatus: 'pending',
    shippingAddress: {
      name: 'Happy Shop Owner',
      address: '123 Beauty Lane, Karen',
      city: 'Nairobi',
      country: 'Kenya',
      phone: '+254712345678',
    },
    createdAt: '2026-04-01T14:00:00Z',
    updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'wp_demo_004',
    storeId: 'store_3',
    storeName: 'K-Beauty Corner',
    items: [
      {
        productId: 'crm_etude_002',
        productName: 'Etude House Drawing Eyebrow Pencil',
        quantity: 50,
        unitPrice: 2.50,
        totalPrice: 125.00,
      },
      {
        productId: 'crm_cosrx_002',
        productName: 'COSRX Acne Pimple Master Patch',
        quantity: 40,
        unitPrice: 3.50,
        totalPrice: 140.00,
      },
    ],
    subtotal: 265.00,
    discount: 13.25,
    tax: 20.14,
    total: 271.89,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'James Mwangi',
      address: '789 Kilimani Rd, Kilimani',
      city: 'Nairobi',
      country: 'Kenya',
      phone: '+254734567890',
    },
    createdAt: '2026-03-28T11:00:00Z',
    updatedAt: '2026-03-30T15:00:00Z',
  },
  {
    id: 'wp_demo_005',
    storeId: 'store_2',
    storeName: 'Glow Beauty Store',
    items: [
      {
        productId: 'crm_beauty_joseon_002',
        productName: 'Beauty of Joseon Glow Serum',
        quantity: 30,
        unitPrice: 14.50,
        totalPrice: 435.00,
      },
    ],
    subtotal: 435.00,
    discount: 43.50,
    tax: 31.32,
    total: 422.82,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'Sarah Kimani',
      address: '456 Westlands Ave, Westlands',
      city: 'Nairobi',
      country: 'Kenya',
      phone: '+254723456789',
    },
    createdAt: '2026-03-25T16:00:00Z',
    updatedAt: '2026-03-28T09:00:00Z',
  },
];

// Combine with existing demo orders
export function getAllDummyOrders(): StorePurchase[] {
  // Import the original demo orders
  const originalOrders: StorePurchase[] = [
    {
      id: 'wp_demo_001',
      storeId: 'store_1',
      storeName: 'Happy Shop',
      items: [
        {
          productId: 'crm_cosrx_001',
          productName: 'COSRX Advanced Snail 96 Mucin Power Essence',
          quantity: 20,
          unitPrice: 15.00,
          totalPrice: 300.00,
        },
        {
          productId: 'crm_cosrx_002',
          productName: 'COSRX Acne Pimple Master Patch',
          quantity: 30,
          unitPrice: 3.50,
          totalPrice: 105.00,
        },
      ],
      subtotal: 405.00,
      discount: 20.25,
      tax: 30.78,
      total: 415.53,
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: {
        name: 'Happy Shop Owner',
        address: '123 Beauty Lane, Karen',
        city: 'Nairobi',
        country: 'Kenya',
        phone: '+254712345678',
      },
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-05T14:30:00Z',
    },
  ];

  return [...originalOrders, ...additionalDummyOrders];
}
