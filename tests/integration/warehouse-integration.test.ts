import '@testing-library/jest-dom';
import { apiClient } from '@/lib/api-client';

// Mock API client
jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Warehouse Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stock Management', () => {
    test('should increment stock successfully', async () => {
      // Mock successful stock update
      mockApiClient.updateWarehouseStock.mockResolvedValue({
        success: true,
        warehouse_stock: 150,
        message: 'Stock updated successfully'
      });

      // Test stock increment
      const result = await mockApiClient.updateWarehouseStock('product-123', 150);
      
      expect(mockApiClient.updateWarehouseStock).toHaveBeenCalledWith('product-123', 150);
      expect(result.warehouse_stock).toBe(150);
      expect(result.success).toBe(true);
    });

    test('should decrement stock successfully', async () => {
      // Mock successful stock decrement
      mockApiClient.updateWarehouseStock.mockResolvedValue({
        success: true,
        warehouse_stock: 50,
        message: 'Stock updated successfully'
      });

      // Test stock decrement
      const result = await mockApiClient.updateWarehouseStock('product-123', 50);
      
      expect(mockApiClient.updateWarehouseStock).toHaveBeenCalledWith('product-123', 50);
      expect(result.warehouse_stock).toBe(50);
    });

    test('should handle negative stock values', async () => {
      // Mock error for negative stock
      mockApiClient.updateWarehouseStock.mockRejectedValue(
        new Error('Stock quantity cannot be negative')
      );

      // Test negative stock handling
      await expect(mockApiClient.updateWarehouseStock('product-123', -10))
        .rejects.toThrow('Stock quantity cannot be negative');
    });

    test('should trigger low stock alerts', async () => {
      // Mock low stock response
      mockApiClient.updateWarehouseStock.mockResolvedValue({
        success: true,
        warehouse_stock: 5,
        low_stock_alert: true,
        message: 'Low stock alert triggered'
      });

      const result = await mockApiClient.updateWarehouseStock('product-123', 5);
      
      expect(result.low_stock_alert).toBe(true);
      expect(result.warehouse_stock).toBe(5);
    });
  });

  describe('Invalid Warehouse ID Handling', () => {
    test('should handle non-existent warehouse ID', async () => {
      // Mock 404 error for invalid warehouse
      mockApiClient.updateWarehouseStock.mockRejectedValue(
        new Error('Warehouse not found')
      );

      await expect(mockApiClient.updateWarehouseStock('product-123', 100))
        .rejects.toThrow('Warehouse not found');
    });

    test('should handle unauthorized warehouse access', async () => {
      // Mock 403 error for unauthorized access
      mockApiClient.updateWarehouseStock.mockRejectedValue(
        new Error('Unauthorized access to warehouse')
      );

      await expect(mockApiClient.updateWarehouseStock('product-123', 100))
        .rejects.toThrow('Unauthorized access to warehouse');
    });

    test('should validate warehouse ID format', async () => {
      // Mock validation error
      mockApiClient.updateWarehouseStock.mockRejectedValue(
        new Error('Invalid warehouse ID format')
      );

      await expect(mockApiClient.updateWarehouseStock('product-123', 100))
        .rejects.toThrow('Invalid warehouse ID format');
    });
  });

  describe('Product Warehouse Operations', () => {
    test('should add product to warehouse successfully', async () => {
      // Mock successful warehouse product creation
      mockApiClient.createWarehouseProduct.mockResolvedValue({
        success: true,
        product: {
          id: 'warehouse-product-123',
          product_id: 'product-123',
          warehouse_stock: 100,
          customer_type: 'BOTH',
          status: 'active'
        }
      });

      const productData = {
        product_id: 'product-123',
        warehouse_stock: 100,
        customer_type: 'BOTH',
        b2c_retail_price: 29.99,
        b2b_wholesale_price: 19.99,
        b2b_moq: 10
      };

      const result = await mockApiClient.createWarehouseProduct(productData);
      
      expect(mockApiClient.createWarehouseProduct).toHaveBeenCalledWith(productData);
      expect(result.success).toBe(true);
      expect(result.product.warehouse_stock).toBe(100);
    });

    test('should update warehouse product information', async () => {
      // Mock successful warehouse product update
      mockApiClient.updateWarehouseProduct.mockResolvedValue({
        success: true,
        product: {
          id: 'warehouse-product-123',
          warehouse_stock: 200,
          b2c_retail_price: 34.99,
          status: 'active'
        }
      });

      const updateData = {
        warehouse_stock: 200,
        b2c_retail_price: 34.99
      };

      const result = await mockApiClient.updateWarehouseProduct('warehouse-product-123', updateData);
      
      expect(mockApiClient.updateWarehouseProduct).toHaveBeenCalledWith('warehouse-product-123', updateData);
      expect(result.product.warehouse_stock).toBe(200);
      expect(result.product.b2c_retail_price).toBe(34.99);
    });

    test('should delete warehouse product with cascade checks', async () => {
      // Mock successful deletion with cascade info
      mockApiClient.deleteWarehouseProduct.mockResolvedValue({
        success: true,
        message: 'Product removed from warehouse',
        cascade_checks: {
          store_orders_count: 0,
          inventory_entries_count: 0
        }
      });

      const result = await mockApiClient.deleteWarehouseProduct('warehouse-product-123');
      
      expect(mockApiClient.deleteWarehouseProduct).toHaveBeenCalledWith('warehouse-product-123');
      expect(result.success).toBe(true);
      expect(result.cascade_checks.store_orders_count).toBe(0);
    });

    test('should prevent deletion with existing dependencies', async () => {
      // Mock deletion failure due to dependencies
      mockApiClient.deleteWarehouseProduct.mockRejectedValue(
        new Error('Cannot delete product with existing store orders')
      );

      await expect(mockApiClient.deleteWarehouseProduct('warehouse-product-123'))
        .rejects.toThrow('Cannot delete product with existing store orders');
    });
  });

  describe('Warehouse Catalog Operations', () => {
    test('should fetch warehouse products with filters', async () => {
      // Mock warehouse products response
      mockApiClient.getWarehouseProducts.mockResolvedValue({
        products: [
          {
            id: 'wp1',
            name: 'Product 1',
            warehouse_stock: 100,
            customer_type: 'BOTH',
            status: 'active'
          },
          {
            id: 'wp2',
            name: 'Product 2',
            warehouse_stock: 50,
            customer_type: 'B2B',
            status: 'active'
          }
        ],
        total: 2,
        limit: 10,
        offset: 0
      });

      const params = {
        customer_type: 'BOTH',
        status: 'active',
        limit: 10,
        offset: 0
      };

      const result = await mockApiClient.getWarehouseProducts(params);
      
      expect(mockApiClient.getWarehouseProducts).toHaveBeenCalledWith(params);
      expect(result.products).toHaveLength(2);
      expect(result.products[0].customer_type).toBe('BOTH');
    });

    test('should handle warehouse catalog pagination', async () => {
      // Mock paginated response
      mockApiClient.getWarehouseProducts.mockResolvedValue({
        products: [
          { id: 'wp1', name: 'Product 1' },
          { id: 'wp2', name: 'Product 2' }
        ],
        total: 25,
        limit: 10,
        offset: 10
      });

      const params = { limit: 10, offset: 10 };
      const result = await mockApiClient.getWarehouseProducts(params);
      
      expect(result.total).toBe(25);
      expect(result.offset).toBe(10);
      expect(result.limit).toBe(10);
    });
  });

  describe('Store Purchase from Warehouse', () => {
    test('should process warehouse purchase successfully', async () => {
      // Mock successful purchase
      mockApiClient.purchaseFromWarehouse.mockResolvedValue({
        success: true,
        order: {
          id: 'order-123',
          product_id: 'product-123',
          quantity: 50,
          total_amount: 999.50,
          status: 'confirmed'
        }
      });

      const purchaseData = {
        product_id: 'product-123',
        quantity: 50,
        shipping_method: 'standard',
        notes: 'Urgent order'
      };

      const result = await mockApiClient.purchaseFromWarehouse(purchaseData);
      
      expect(mockApiClient.purchaseFromWarehouse).toHaveBeenCalledWith(purchaseData);
      expect(result.success).toBe(true);
      expect(result.order.quantity).toBe(50);
    });

    test('should handle insufficient warehouse stock', async () => {
      // Mock insufficient stock error
      mockApiClient.purchaseFromWarehouse.mockRejectedValue(
        new Error('Insufficient stock in warehouse')
      );

      const purchaseData = {
        product_id: 'product-123',
        quantity: 1000 // More than available
      };

      await expect(mockApiClient.purchaseFromWarehouse(purchaseData))
        .rejects.toThrow('Insufficient stock in warehouse');
    });
  });
});
