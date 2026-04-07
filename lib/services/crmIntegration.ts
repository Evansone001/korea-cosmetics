// CRM Integration Service for Custom CRM
// Supports webhook-based data synchronization

export interface CRMConfig {
  webhookUrl: string;
  apiKey: string;
  enabled: boolean;
  syncEvents: CRMSyncEvent[];
}

export type CRMSyncEvent = 
  | 'customer.created'
  | 'customer.updated'
  | 'order.created'
  | 'order.updated'
  | 'order.paid'
  | 'product.created'
  | 'store.approved';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: unknown;
}

class CRMIntegrationService {
  private config: CRMConfig | null = null;

  setConfig(config: CRMConfig) {
    this.config = config;
  }

  getConfig(): CRMConfig | null {
    return this.config;
  }

  isEnabled(): boolean {
    return this.config?.enabled ?? false;
  }

  async sendWebhook(event: CRMSyncEvent, data: unknown): Promise<boolean> {
    if (!this.isEnabled() || !this.config) {
      console.log(`CRM integration disabled, skipping event: ${event}`);
      return false;
    }

    if (!this.config.syncEvents.includes(event)) {
      console.log(`Event ${event} not configured for sync`);
      return false;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Event-Type': event,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log(`✓ CRM webhook sent: ${event}`);
      return true;
    } catch (error) {
      console.error(`✗ CRM webhook failed: ${event}`, error);
      return false;
    }
  }

  // Event-specific methods
  async syncCustomer(customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
  }) {
    return this.sendWebhook('customer.created', {
      type: 'contact',
      ...customer,
    });
  }

  async syncOrder(order: {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    createdAt: string;
  }) {
    return this.sendWebhook('order.created', {
      type: 'deal',
      ...order,
    });
  }

  async syncProduct(product: {
    id: string;
    name: string;
    price: number;
    category: string;
    storeId: string;
    inStock: boolean;
  }) {
    return this.sendWebhook('product.created', {
      type: 'product',
      ...product,
    });
  }

  async syncStore(store: {
    id: string;
    name: string;
    username: string;
    email: string;
    status: string;
    createdAt: string;
  }) {
    return this.sendWebhook('store.approved', {
      type: 'account',
      ...store,
    });
  }
}

// Singleton instance
export const crmService = new CRMIntegrationService();

// Helper to initialize from environment or DB
export async function initCRMService(): Promise<void> {
  // In production, load from database or environment
  const config: CRMConfig = {
    webhookUrl: process.env.CRM_WEBHOOK_URL || '',
    apiKey: process.env.CRM_API_KEY || '',
    enabled: process.env.CRM_ENABLED === 'true',
    syncEvents: [
      'customer.created',
      'order.created',
      'order.paid',
      'store.approved',
    ],
  };

  if (config.webhookUrl) {
    crmService.setConfig(config);
    console.log('✓ CRM integration initialized');
  }
}
