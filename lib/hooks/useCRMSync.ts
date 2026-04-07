import { useCallback } from 'react';
import { crmService } from '@/lib/services/crmIntegration';

// Hook to sync customer to CRM
export function useCRMSync() {
  const syncCustomer = useCallback(async (customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
  }) => {
    return crmService.syncCustomer(customer);
  }, []);

  const syncOrder = useCallback(async (order: {
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
  }) => {
    return crmService.syncOrder(order);
  }, []);

  const syncProduct = useCallback(async (product: {
    id: string;
    name: string;
    price: number;
    category: string;
    storeId: string;
    inStock: boolean;
  }) => {
    return crmService.syncProduct(product);
  }, []);

  const syncStore = useCallback(async (store: {
    id: string;
    name: string;
    username: string;
    email: string;
    status: string;
    createdAt: string;
  }) => {
    return crmService.syncStore(store);
  }, []);

  return {
    syncCustomer,
    syncOrder,
    syncProduct,
    syncStore,
    isEnabled: crmService.isEnabled(),
  };
}

// Hook to auto-sync on order creation
export function useAutoSyncOrder() {
  const { syncOrder, isEnabled } = useCRMSync();

  return useCallback(async (orderData: Parameters<typeof syncOrder>[0]) => {
    if (!isEnabled) return;
    
    try {
      await syncOrder(orderData);
    } catch (error) {
      console.error('Auto-sync order failed:', error);
    }
  }, [syncOrder, isEnabled]);
}

// Hook to auto-sync on customer registration
export function useAutoSyncCustomer() {
  const { syncCustomer, isEnabled } = useCRMSync();

  return useCallback(async (customerData: Parameters<typeof syncCustomer>[0]) => {
    if (!isEnabled) return;
    
    try {
      await syncCustomer(customerData);
    } catch (error) {
      console.error('Auto-sync customer failed:', error);
    }
  }, [syncCustomer, isEnabled]);
}
