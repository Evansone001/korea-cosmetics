// Demo data for testing CRM sync and wholesale purchasing
// This simulates products coming from Korean manufacturers via CRM

import { WholesaleProduct, StorePurchase, StoreInventory } from '../services/wholesale';

export const demoCRMProducts: WholesaleProduct[] = [
  {
    id: 'crm_cosrx_001',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    description: 'Lightweight essence with 96% snail mucin extract for intense hydration and skin repair. Perfect for dry and sensitive skin types.',
    wholesalePrice: 15.00,
    retailPrice: 32.00,
    mrp: 38.00,
    category: 'Skincare',
    manufacturer: 'COSRX',
    brand: 'COSRX',
    images: ['https://cdn.example.com/cosrx-snail-essence.jpg'],
    minOrderQuantity: 12,
    availableStock: 500,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_cosrx_002',
    name: 'COSRX Acne Pimple Master Patch',
    description: 'Hydrocolloid patches that protect pimples and absorb impurities. 24 patches per pack.',
    wholesalePrice: 3.50,
    retailPrice: 8.50,
    mrp: 10.00,
    category: 'Skincare',
    manufacturer: 'COSRX',
    brand: 'COSRX',
    images: ['https://cdn.example.com/cosrx-pimple-patch.jpg'],
    minOrderQuantity: 24,
    availableStock: 1000,
    unit: 'pack',
    origin: 'South Korea',
  },
  {
    id: 'crm_innisfree_001',
    name: 'Innisfree Green Tea Seed Serum',
    description: 'Hydrating serum with Jeju green tea extract and green tea seed oil for deep moisture.',
    wholesalePrice: 18.50,
    retailPrice: 38.00,
    mrp: 45.00,
    category: 'Skincare',
    manufacturer: 'Innisfree',
    brand: 'Innisfree',
    images: ['https://cdn.example.com/innisfree-green-tea.jpg'],
    minOrderQuantity: 10,
    availableStock: 300,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_innisfree_002',
    name: 'Innisfree Super Volcanic Pore Clay Mask',
    description: 'Pore clearing clay mask with Jeju volcanic clusters absorbs excess oil and impurities.',
    wholesalePrice: 12.00,
    retailPrice: 26.00,
    mrp: 30.00,
    category: 'Skincare',
    manufacturer: 'Innisfree',
    brand: 'Innisfree',
    images: ['https://cdn.example.com/innisfree-volcanic.jpg'],
    minOrderQuantity: 12,
    availableStock: 250,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_som_by_mi_001',
    name: 'Some By Mi AHA-BHA-PHA 30 Days Miracle Toner',
    description: 'Exfoliating toner with tea tree water and three types of acids for clear skin.',
    wholesalePrice: 14.00,
    retailPrice: 28.00,
    mrp: 32.00,
    category: 'Skincare',
    manufacturer: 'Some By Mi',
    brand: 'Some By Mi',
    images: ['https://cdn.example.com/somebymi-miracle.jpg'],
    minOrderQuantity: 12,
    availableStock: 400,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_som_by_mi_002',
    name: 'Some By Mi Snail Truecica Miracle Repair Serum',
    description: 'Repair serum with black snail mucin and Truecica for damaged skin barrier.',
    wholesalePrice: 16.00,
    retailPrice: 34.00,
    mrp: 40.00,
    category: 'Skincare',
    manufacturer: 'Some By Mi',
    brand: 'Some By Mi',
    images: ['https://cdn.example.com/somebymi-truecica.jpg'],
    minOrderQuantity: 10,
    availableStock: 350,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_beauty_joseon_001',
    name: 'Beauty of Joseon Dynasty Cream',
    description: 'Luxurious cream with rice bran water and ginseng extract for radiant skin.',
    wholesalePrice: 20.00,
    retailPrice: 42.00,
    mrp: 48.00,
    category: 'Skincare',
    manufacturer: 'Beauty of Joseon',
    brand: 'Beauty of Joseon',
    images: ['https://cdn.example.com/boj-dynasty.jpg'],
    minOrderQuantity: 8,
    availableStock: 200,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_beauty_joseon_002',
    name: 'Beauty of Joseon Glow Serum Propolis + Niacinamide',
    description: 'Brightening serum with propolis extract and niacinamide for glowing skin.',
    wholesalePrice: 14.50,
    retailPrice: 30.00,
    mrp: 35.00,
    category: 'Skincare',
    manufacturer: 'Beauty of Joseon',
    brand: 'Beauty of Joseon',
    images: ['https://cdn.example.com/boj-glow.jpg'],
    minOrderQuantity: 12,
    availableStock: 450,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_laneige_001',
    name: 'Laneige Water Sleeping Mask',
    description: 'Overnight sleeping mask that intensely hydrates and brightens skin while you sleep.',
    wholesalePrice: 19.00,
    retailPrice: 40.00,
    mrp: 48.00,
    category: 'Skincare',
    manufacturer: 'Laneige',
    brand: 'Laneige',
    images: ['https://cdn.example.com/laneige-sleeping.jpg'],
    minOrderQuantity: 10,
    availableStock: 300,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_laneige_002',
    name: 'Laneige Lip Sleeping Mask Berry',
    description: 'Leave-on lip mask that soothes and moisturizes with berry mix complex.',
    wholesalePrice: 13.00,
    retailPrice: 28.00,
    mrp: 32.00,
    category: 'Lip Care',
    manufacturer: 'Laneige',
    brand: 'Laneige',
    images: ['https://cdn.example.com/laneige-lip.jpg'],
    minOrderQuantity: 12,
    availableStock: 600,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_etude_001',
    name: 'Etude House SoonJung 2x Barrier Intensive Cream',
    description: 'Hypoallergenic cream for sensitive skin with panthenol and madecassoside.',
    wholesalePrice: 11.00,
    retailPrice: 24.00,
    mrp: 28.00,
    category: 'Skincare',
    manufacturer: 'Etude House',
    brand: 'Etude House',
    images: ['https://cdn.example.com/etude-soonjung.jpg'],
    minOrderQuantity: 12,
    availableStock: 400,
    unit: 'piece',
    origin: 'South Korea',
  },
  {
    id: 'crm_etude_002',
    name: 'Etude House Drawing Eyebrow Pencil',
    description: 'Easy-to-use eyebrow pencil with triangular tip for natural-looking brows.',
    wholesalePrice: 2.50,
    retailPrice: 6.00,
    mrp: 7.50,
    category: 'Makeup',
    manufacturer: 'Etude House',
    brand: 'Etude House',
    images: ['https://cdn.example.com/etude-eyebrow.jpg'],
    minOrderQuantity: 24,
    availableStock: 800,
    unit: 'piece',
    origin: 'South Korea',
  },
];

// Demo store purchases for testing
export const demoStorePurchases: StorePurchase[] = [
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

// Demo store inventory showing purchased items with sales
export const demoStoreInventory: StoreInventory[] = [
  {
    productId: 'crm_cosrx_001',
    productName: 'COSRX Advanced Snail 96 Mucin Power Essence',
    purchasedQuantity: 20,
    soldQuantity: 15,
    availableQuantity: 5,
    unitCost: 15.00,
    currentRetailPrice: 35.00,
    lastRestockedAt: '2026-03-05T14:30:00Z',
    lowStockThreshold: 5,
  },
  {
    productId: 'crm_cosrx_002',
    productName: 'COSRX Acne Pimple Master Patch',
    purchasedQuantity: 30,
    soldQuantity: 24,
    availableQuantity: 6,
    unitCost: 3.50,
    currentRetailPrice: 9.00,
    lastRestockedAt: '2026-03-05T14:30:00Z',
    lowStockThreshold: 10,
  },
  {
    productId: 'crm_beauty_joseon_001',
    productName: 'Beauty of Joseon Dynasty Cream',
    purchasedQuantity: 10,
    soldQuantity: 8,
    availableQuantity: 2,
    unitCost: 20.00,
    currentRetailPrice: 45.00,
    lastRestockedAt: '2026-03-10T09:00:00Z',
    lowStockThreshold: 3,
  },
];

// Pricing tiers for demo
export const demoPricingTiers = {
  standard: { name: 'Standard', discount: 0.4, minOrder: 100 },
  premium: { name: 'Premium', discount: 0.5, minOrder: 500 },
  exclusive: { name: 'Exclusive', discount: 0.6, minOrder: 1000 },
};

// Helper to get demo products
export function getDemoCRMProducts(): WholesaleProduct[] {
  return [...demoCRMProducts];
}

// Helper to simulate CRM sync
export function simulateCRMSync(): {
  success: boolean;
  imported: number;
  products: WholesaleProduct[];
} {
  return {
    success: true,
    imported: demoCRMProducts.length,
    products: demoCRMProducts,
  };
}

// Helper to get products by manufacturer
export function getProductsByManufacturer(manufacturer: string): WholesaleProduct[] {
  return demoCRMProducts.filter(p => p.manufacturer === manufacturer);
}

// Helper to get products by category
export function getProductsByCategory(category: string): WholesaleProduct[] {
  return demoCRMProducts.filter(p => p.category === category);
}
