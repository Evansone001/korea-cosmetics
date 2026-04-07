// Wholesale purchase service - Stores buying from Admin in bulk

// Landing cost breakdown for imported products
export interface LandingCostBreakdown {
  productCost: number;    // What admin pays manufacturer in Korea (FOB price)
  shippingCost: number;   // Freight/shipping per unit (Korea→Kenya)
  dutyCost: number;       // Kenya import duties/tariffs per unit
  otherCost: number;      // Insurance, customs fees, clearance, etc.
}

// Wholesale product from manufacturer (Korean suppliers)
export interface WholesaleProduct {
  id: string;
  name: string;
  description: string;
  wholesalePrice: number;  // Price stores pay to admin
  retailPrice: number;   // Suggested price for store's customers
  mrp?: number;
  category: string;
  manufacturer: string;
  brand: string;
  images: string[];
  minOrderQuantity: number;  // Minimum units per order
  availableStock: number;    // Admin's available stock
  unit: string;  // e.g., 'piece', 'box', 'carton'
  origin: string;
  // Landing cost for admin's true import cost
  landingCost?: number;
  landingCostBreakdown?: LandingCostBreakdown;
}

export interface StorePurchase {
  id: string;
  storeId: string;
  storeName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreInventory {
  productId: string;
  productName: string;
  purchasedQuantity: number;    // Total bought from admin
  soldQuantity: number;         // Total sold to customers
  availableQuantity: number;    // purchased - sold
  unitCost: number;             // What store paid per unit
  currentRetailPrice: number;   // What store sells for
  lastRestockedAt: string;
  lowStockThreshold: number;
}

class WholesaleService {
  private wholesalePricingTiers = new Map<string, number>([
    ['standard', 0.6],    // 40% discount for standard wholesalers
    ['premium', 0.5],       // 50% discount for premium wholesalers
    ['exclusive', 0.4],    // 60% discount for exclusive partners
  ]);

  // Calculate wholesale price based on retail price and store tier
  calculateWholesalePrice(retailPrice: number, tier: string = 'standard'): number {
    const discount = this.wholesalePricingTiers.get(tier) || 0.6;
    return Math.round(retailPrice * discount * 100) / 100;
  }

  // Store adds products to their wholesale cart
  async addToWholesaleCart(
    storeId: string,
    productId: string,
    quantity: number,
    tier: string = 'standard'
  ): Promise<boolean> {
    try {
      // Get product from admin catalog
      const product = await this.getAdminProduct(productId);
      
      if (!product) {
        throw new Error('Product not available for wholesale');
      }

      // Check minimum order quantity
      if (quantity < product.minOrderQuantity) {
        throw new Error(`Minimum order quantity is ${product.minOrderQuantity}`);
      }

      // Check admin stock
      if (quantity > product.availableStock) {
        throw new Error('Insufficient stock from supplier');
      }

      const wholesalePrice = this.calculateWholesalePrice(product.wholesalePrice, tier);

      // Add to store's wholesale cart
      await this.saveWholesaleCartItem(storeId, {
        productId,
        productName: product.name,
        quantity,
        unitPrice: wholesalePrice,
        totalPrice: wholesalePrice * quantity,
        addedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to add to wholesale cart:', error);
      return false;
    }
  }

  // Store places wholesale order
  async placeWholesaleOrder(
    storeId: string,
    cartItems: Array<{
      productId: string;
      quantity: number;
    }>,
    shippingAddress: StorePurchase['shippingAddress'],
    discountCode?: string
  ): Promise<StorePurchase | null> {
    try {
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const product = await this.getAdminProduct(item.productId);
        if (!product) continue;

        const unitPrice = product.wholesalePrice;
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });

        // Reserve stock
        await this.reserveAdminStock(item.productId, item.quantity);
      }

      // Apply discount if valid
      let discount = 0;
      if (discountCode) {
        discount = await this.calculateDiscount(subtotal, discountCode);
      }

      // Calculate tax (if applicable)
      const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100; // 8% tax

      const total = subtotal - discount + tax;

      // Create purchase order
      const purchase: StorePurchase = {
        id: `wp_${Date.now()}_${storeId}`,
        storeId,
        storeName: '', // Will be populated from store profile
        items: orderItems,
        subtotal,
        discount,
        tax,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save purchase
      await this.savePurchase(purchase);

      // Clear cart
      await this.clearWholesaleCart(storeId);

      return purchase;
    } catch (error) {
      console.error('Failed to place wholesale order:', error);
      return null;
    }
  }

  // Admin confirms order and ships
  async confirmAndShipOrder(
    purchaseId: string,
    trackingNumber?: string
  ): Promise<boolean> {
    try {
      const purchase = await this.getPurchase(purchaseId);
      if (!purchase) return false;

      // Update status
      purchase.status = 'shipped';
      purchase.updatedAt = new Date().toISOString();

      await this.savePurchase(purchase);

      // Add products to store's inventory
      for (const item of purchase.items) {
        await this.addToStoreInventory(
          purchase.storeId,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice
        );
      }

      return true;
    } catch (error) {
      console.error('Failed to ship order:', error);
      return false;
    }
  }

  // Add purchased items to store inventory
  private async addToStoreInventory(
    storeId: string,
    productId: string,
    productName: string,
    quantity: number,
    unitCost: number
  ): Promise<void> {
    const existingInventory = await this.getStoreInventoryItem(storeId, productId);

    if (existingInventory) {
      // Update existing
      existingInventory.purchasedQuantity += quantity;
      existingInventory.availableQuantity += quantity;
      existingInventory.unitCost = 
        (existingInventory.unitCost * (existingInventory.purchasedQuantity - quantity) + 
         unitCost * quantity) / existingInventory.purchasedQuantity;
      existingInventory.lastRestockedAt = new Date().toISOString();
      
      await this.saveStoreInventory(existingInventory);
    } else {
      // Create new inventory entry
      const inventory: StoreInventory = {
        productId,
        productName,
        purchasedQuantity: quantity,
        soldQuantity: 0,
        availableQuantity: quantity,
        unitCost,
        currentRetailPrice: unitCost * 1.5, // 50% markup as default
        lastRestockedAt: new Date().toISOString(),
        lowStockThreshold: 5,
      };
      
      await this.saveStoreInventory(inventory);
    }
  }

  // When store sells to customer, reduce their inventory
  async recordStoreSale(
    storeId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const inventory = await this.getStoreInventoryItem(storeId, productId);
      if (!inventory || inventory.availableQuantity < quantity) {
        return false;
      }

      inventory.soldQuantity += quantity;
      inventory.availableQuantity -= quantity;

      await this.saveStoreInventory(inventory);

      return true;
    } catch (error) {
      console.error('Failed to record store sale:', error);
      return false;
    }
  }

  // Get store's inventory
  async getStoreInventory(storeId: string): Promise<StoreInventory[]> {
    // In production, query database
    return [];
  }

  // Get low stock alerts
  async getLowStockAlerts(storeId: string): Promise<StoreInventory[]> {
    const inventory = await this.getStoreInventory(storeId);
    return inventory.filter(
      item => item.availableQuantity <= item.lowStockThreshold
    );
  }

  // Update retail price (what store sells for)
  async updateRetailPrice(
    storeId: string,
    productId: string,
    newPrice: number
  ): Promise<boolean> {
    try {
      const inventory = await this.getStoreInventoryItem(storeId, productId);
      if (!inventory) return false;

      inventory.currentRetailPrice = newPrice;
      await this.saveStoreInventory(inventory);

      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper methods (would connect to database in production)
  private async getAdminProduct(productId: string): Promise<WholesaleProduct | null> {
    return null;
  }

  private async saveWholesaleCartItem(storeId: string, item: unknown): Promise<void> {}
  private async clearWholesaleCart(storeId: string): Promise<void> {}
  private async savePurchase(purchase: StorePurchase): Promise<void> {}
  private async getPurchase(purchaseId: string): Promise<StorePurchase | null> {
    return null;
  }
  private async reserveAdminStock(productId: string, quantity: number): Promise<void> {}
  private async calculateDiscount(subtotal: number, code: string): Promise<number> {
    return 0;
  }
  private async getStoreInventoryItem(
    storeId: string, 
    productId: string
  ): Promise<StoreInventory | null> {
    return null;
  }
  private async saveStoreInventory(inventory: StoreInventory): Promise<void> {}
}

export const wholesaleService = new WholesaleService();
