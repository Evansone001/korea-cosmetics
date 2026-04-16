// Service to pull products FROM external CRM into KoreaCosmetics' Hub
// Admin uses this to sync the master product catalog

import { CRMConfig } from './crmIntegration';

export interface CRMProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  category: string;
  manufacturer: string;
  brand: string;
  images: string[];
  specifications: {
    size?: string;
    skinTypes?: string;
    keyIngredients?: string[];
    keyBenefits?: string[];
    howToUse?: string;
  };
  stock: number;
  origin: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
  products: CRMProduct[];
}

class CRMProductSyncService {
  private config: CRMConfig | null = null;

  setConfig(config: CRMConfig) {
    this.config = config;
  }

  async fetchProductsFromCRM(filters?: {
    manufacturer?: string;
    category?: string;
    since?: string;
  }): Promise<CRMProduct[]> {
    if (!this.config?.enabled || !this.config?.webhookUrl) {
      throw new Error('CRM not configured');
    }

    // Build query params
    const params = new URLSearchParams();
    if (filters?.manufacturer) params.append('manufacturer', filters.manufacturer);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.since) params.append('since', filters.since);

    const url = `${this.config.webhookUrl}/products?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    return data.products as CRMProduct[];
  }

  async syncProducts(products: CRMProduct[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
      products: [],
    };

    for (const product of products) {
      try {
        // Check if product already exists in KoreaCosmetics' Hub
        const existing = await this.findExistingProduct(product.id);

        if (existing) {
          // Update existing
          await this.updateProduct(existing.id, product);
          result.updated++;
        } else {
          // Create new
          await this.createProduct(product);
          result.imported++;
        }

        result.products.push(product);
      } catch (error) {
        result.failed++;
        result.errors.push(`Product ${product.id}: ${error}`);
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  private async findExistingProduct(crmId: string): Promise<{ id: string } | null> {
    // Query Prisma to find product by CRM ID
    // This would be a real database query in production
    return null;
  }

  private async createProduct(product: CRMProduct): Promise<void> {
    // Create product in KoreaCosmetics' Hub database
    // Assign to admin as the supplier
    console.log('Creating product:', product.name);
  }

  private async updateProduct(id: string, product: CRMProduct): Promise<void> {
    // Update existing product
    console.log('Updating product:', product.name);
  }

  // Admin can push specific products to specific stores
  async distributeToStore(
    productIds: string[],
    storeId: string,
    pricing?: { markup: number }
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/distribute-products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds,
          storeId,
          pricing,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Distribution failed:', error);
      return false;
    }
  }
}

export const crmProductSync = new CRMProductSyncService();
