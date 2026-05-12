// Sample test data for catalog functionality testing

export const mockCategories = [
  {
    id: '1',
    name: 'Skincare',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Makeup',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Hair Care',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Cleansers',
    parent_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Moisturizers',
    parent_id: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockManufacturers = [
  {
    id: '1',
    name: 'Amorepacific',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'LG Household & Health Care',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'COSRX',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Innisfree',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Advanced Snail Mucin Essence',
    description: 'A hydrating essence with snail mucin for skin repair',
    price: 24.99,
    mrp: 29.99,
    category: 'Skincare',
    manufacturer: 'COSRX',
    brand: 'COSRX',
    origin: 'Korea',
    stock_quantity: 150,
    size: '100ml',
    formula: 'Water-based',
    how_to_use: 'Apply after cleansing and toning',
    key_benefits: 'Hydration, skin repair, anti-aging',
    key_ingredients: 'Snail mucin, hyaluronic acid',
    skin_types: 'All skin types',
    skin_concerns: 'Dryness, aging, dullness',
    texture: 'Lightweight serum',
    images: ['/uploads/products/snail-essence-1.jpg'],
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Green Tea Seed Serum',
    description: 'Antioxidant-rich serum with green tea seed oil',
    price: 18.99,
    mrp: 22.99,
    category: 'Skincare',
    manufacturer: 'Innisfree',
    brand: 'Innisfree',
    origin: 'Korea',
    stock_quantity: 200,
    size: '50ml',
    formula: 'Oil-based serum',
    how_to_use: 'Apply 2-3 drops to clean skin',
    key_benefits: 'Antioxidant protection, hydration',
    key_ingredients: 'Green tea seed oil, vitamin E',
    skin_types: 'Normal to oily',
    skin_concerns: 'Oxidative stress, dehydration',
    texture: 'Light oil',
    images: ['/uploads/products/green-tea-serum-1.jpg'],
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

export const mockWarehouses = [
  {
    id: '1',
    name: 'Main Warehouse',
    location: 'Seoul, South Korea',
    capacity: 10000,
    current_stock: 7500,
    manager: 'Kim Min-jun',
    contact: '+82-2-1234-5678',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Secondary Warehouse',
    location: 'Busan, South Korea',
    capacity: 5000,
    current_stock: 3200,
    manager: 'Lee Soo-min',
    contact: '+82-51-9876-5432',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockWarehouseProducts = [
  {
    id: 'wp1',
    product_id: '1',
    name: 'Advanced Snail Mucin Essence',
    warehouse_stock: 500,
    b2c_retail_price: 24.99,
    b2b_wholesale_price: 18.99,
    b2b_moq: 10,
    customer_type: 'BOTH',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'wp2',
    product_id: '2',
    name: 'Green Tea Seed Serum',
    warehouse_stock: 750,
    b2c_retail_price: 18.99,
    b2b_wholesale_price: 14.99,
    b2b_moq: 15,
    customer_type: 'B2B',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

export const mockOrders = [
  {
    id: 'order-1',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123'
    },
    items: [
      {
        product_id: '1',
        product_name: 'Advanced Snail Mucin Essence',
        quantity: 2,
        price: 24.99,
        total: 49.98
      }
    ],
    total: 49.98,
    status: 'pending',
    is_paid: false,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'order-2',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-0456'
    },
    items: [
      {
        product_id: '2',
        product_name: 'Green Tea Seed Serum',
        quantity: 1,
        price: 18.99,
        total: 18.99
      }
    ],
    total: 18.99,
    status: 'shipped',
    is_paid: true,
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-15T09:15:00Z'
  }
];

export const mockImages = [
  {
    url: '/uploads/products/test-image-1.jpg',
    filename: 'test-image-1.jpg',
    size: 1024 * 1024, // 1MB
    type: 'image/jpeg'
  },
  {
    url: '/uploads/products/test-image-2.png',
    filename: 'test-image-2.png',
    size: 2 * 1024 * 1024, // 2MB
    type: 'image/png'
  },
  {
    url: '/uploads/products/test-image-3.webp',
    filename: 'test-image-3.webp',
    size: 512 * 1024, // 512KB
    type: 'image/webp'
  }
];

export const mockErrorResponse = {
  error: 'Test error message',
  status: 400,
  timestamp: '2024-01-01T00:00:00Z'
};

export const mockSuccessResponse = {
  success: true,
  message: 'Operation completed successfully',
  timestamp: '2024-01-01T00:00:00Z'
};

// Test scenarios
export const testScenarios = {
  validProductCreation: {
    name: 'Test Product',
    description: 'This is a test product for automated testing',
    price: 29.99,
    category: 'Skincare',
    brand: 'Test Brand',
    manufacturer: 'Test Manufacturer',
    origin: 'Korea',
    stock_quantity: 100,
    size: '50ml',
    formula: 'Test formula',
    how_to_use: 'Apply to clean skin',
    key_benefits: 'Test benefits',
    key_ingredients: 'Test ingredients',
    skin_types: 'All skin types',
    skin_concerns: 'Test concerns',
    texture: 'Test texture'
  },
  
  invalidProductCreation: {
    name: '', // Invalid: empty name
    description: 'Test description',
    price: -10, // Invalid: negative price
    category: '',
    brand: 'Test Brand',
    manufacturer: 'Test Manufacturer',
    origin: 'Korea',
    stock_quantity: -5, // Invalid: negative stock
    size: '50ml',
    formula: 'Test formula',
    how_to_use: 'Apply to clean skin',
    key_benefits: 'Test benefits',
    key_ingredients: 'Test ingredients',
    skin_types: 'All skin types',
    skin_concerns: 'Test concerns',
    texture: 'Test texture'
  },
  
  largeImageUpload: {
    filename: 'large-image.jpg',
    size: 6 * 1024 * 1024, // 6MB - exceeds 5MB limit
    type: 'image/jpeg'
  },
  
  invalidImageUpload: {
    filename: 'malware.exe',
    size: 1024 * 1024, // 1MB
    type: 'application/x-executable'
  }
};
