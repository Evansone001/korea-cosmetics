import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, requireRole, checkRateLimit, logAuditEvent } from '@/lib/security';

interface InventoryItem {
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  purchasedQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  unitCost: number;
  currentRetailPrice: number;
  wholesaleOrderId: string;
  syncedToPublic: boolean;
  publicProductId?: string;
}

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
  inventoryProductId?: string;
  wholesaleOrderId?: string;
}

// Mock data - store inventory items
const storeInventoryItems = new Map<string, InventoryItem[]>();

// Mock public products
const publicStoreProducts = new Map<string, PublicProduct[]>();

// GET - Get inventory items that can be synced to public store
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'store_1';
    const inventory = storeInventoryItems.get(storeId) || [];
    
    // Filter items not yet synced
    const unsyncedItems = inventory.filter(item => !item.syncedToPublic && item.availableQuantity > 0);
    
    return NextResponse.json({
      success: true,
      unsyncedItems,
      syncedItems: inventory.filter(item => item.syncedToPublic),
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST - Sync inventory item to public store product
export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'store_1';
    const body = await request.json();
    const { inventoryProductId, customPrice, customDescription, customImages } = body;

    if (!inventoryProductId) {
      return NextResponse.json({ error: 'inventoryProductId required' }, { status: 400 });
    }

    // Get inventory
    const inventory = storeInventoryItems.get(storeId) || [];
    const inventoryItem = inventory.find(item => item.productId === inventoryProductId);

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    if (inventoryItem.syncedToPublic) {
      return NextResponse.json({ error: 'Item already synced to public store' }, { status: 400 });
    }

    if (inventoryItem.availableQuantity <= 0) {
      return NextResponse.json({ error: 'No stock available to sync' }, { status: 400 });
    }

    // Generate public product
    const publicProductId = `pub_${storeId}_${inventoryProductId}_${Date.now()}`;
    const publicProduct = {
      id: publicProductId,
      name: inventoryItem.productName,
      description: customDescription || `Authentic ${inventoryItem.manufacturer} product. Premium quality Korean beauty product sourced directly from authorized distributors.`,
      price: customPrice || inventoryItem.currentRetailPrice,
      mrp: Math.round(inventoryItem.currentRetailPrice * 1.2 * 100) / 100,
      category: inventoryItem.category,
      manufacturer: inventoryItem.manufacturer,
      images: customImages || [],
      stock: inventoryItem.availableQuantity,
      inStock: inventoryItem.availableQuantity > 0,
      isFromInventory: true,
      inventoryProductId: inventoryProductId,
      wholesaleOrderId: inventoryItem.wholesaleOrderId,
    };

    // Save to public products
    const storeProducts = publicStoreProducts.get(storeId) || [];
    storeProducts.push(publicProduct);
    publicStoreProducts.set(storeId, storeProducts);

    // Mark as synced in inventory
    inventoryItem.syncedToPublic = true;
    inventoryItem.publicProductId = publicProductId;

    await logAuditEvent({
      action: 'INVENTORY_SYNCED_TO_PUBLIC',
      userId: storeId,
      userRole: 'store',
      resourceType: 'inventory-sync',
      resourceId: publicProductId,
      details: {
        inventoryProductId,
        price: publicProduct.price,
        stock: publicProduct.stock,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product synced to public store',
      publicProduct,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync product' }, { status: 500 });
  }
}

// PUT - Update stock when customer buys from public store
export async function PUT(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'store_1';
    const body = await request.json();
    const { publicProductId, quantitySold } = body;

    if (!publicProductId || !quantitySold) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get public product
    const storeProducts = publicStoreProducts.get(storeId) || [];
    const publicProductIndex = storeProducts.findIndex(p => p.id === publicProductId);

    if (publicProductIndex === -1) {
      return NextResponse.json({ error: 'Public product not found' }, { status: 404 });
    }

    const publicProduct = storeProducts[publicProductIndex];

    if (publicProduct.stock < quantitySold) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Update public product stock
    publicProduct.stock -= quantitySold;
    publicProduct.inStock = publicProduct.stock > 0;

    // Update inventory sold quantity
    const inventory = storeInventoryItems.get(storeId) || [];
    const inventoryItem = inventory.find(item => item.productId === publicProduct.inventoryProductId);
    
    if (inventoryItem) {
      inventoryItem.soldQuantity += quantitySold;
      inventoryItem.availableQuantity -= quantitySold;
    }

    await logAuditEvent({
      action: 'PUBLIC_PRODUCT_SOLD',
      userId: storeId,
      userRole: 'store',
      resourceType: 'store-sale',
      resourceId: publicProductId,
      details: {
        quantitySold,
        remainingStock: publicProduct.stock,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Stock updated',
      remainingStock: publicProduct.stock,
      inventoryRemaining: inventoryItem?.availableQuantity || 0,
    });
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}

// DELETE - Remove product from public store (but keep in inventory)
export async function DELETE(request: NextRequest) {
  try {
    const storeId = request.headers.get('X-User-Id') || 'store_1';
    const { searchParams } = new URL(request.url);
    const publicProductId = searchParams.get('publicProductId');

    if (!publicProductId) {
      return NextResponse.json({ error: 'publicProductId required' }, { status: 400 });
    }

    // Remove from public products
    const storeProducts = publicStoreProducts.get(storeId) || [];
    const productIndex = storeProducts.findIndex(p => p.id === publicProductId);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const removedProduct = storeProducts[productIndex];
    storeProducts.splice(productIndex, 1);
    publicStoreProducts.set(storeId, storeProducts);

    // Mark as unsynced in inventory
    const inventory = storeInventoryItems.get(storeId) || [];
    const inventoryItem = inventory.find(item => item.publicProductId === publicProductId);
    if (inventoryItem) {
      inventoryItem.syncedToPublic = false;
      inventoryItem.publicProductId = undefined;
    }

    return NextResponse.json({
      success: true,
      message: 'Product removed from public store',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to remove product' }, { status: 500 });
  }
}
