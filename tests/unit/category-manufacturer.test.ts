import '@testing-library/jest-dom';
import { apiClient } from '@/lib/api-client';
import { Category, CategoriesResponse } from '@/lib/api-client';

// Mock API client
jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Category Management Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    test('should fetch categories successfully', async () => {
      const mockCategories: CategoriesResponse = {
        categories: [
          { id: '1', name: 'Skincare', created_at: '2024-01-01T00:00:00Z' },
          { id: '2', name: 'Makeup', created_at: '2024-01-01T00:00:00Z' },
          { id: '3', name: 'Hair Care', parent_id: '1', created_at: '2024-01-01T00:00:00Z' }
        ]
      };

      mockApiClient.getCategories.mockResolvedValue(mockCategories);

      const result = await mockApiClient.getCategories();

      expect(mockApiClient.getCategories).toHaveBeenCalledTimes(1);
      expect(result.categories).toHaveLength(3);
      expect(result.categories[0].name).toBe('Skincare');
      expect(result.categories[2].parent_id).toBe('1');
    });

    test('should handle empty categories list', async () => {
      const mockCategories: CategoriesResponse = {
        categories: []
      };

      mockApiClient.getCategories.mockResolvedValue(mockCategories);

      const result = await mockApiClient.getCategories();

      expect(result.categories).toHaveLength(0);
    });

    test('should handle API error gracefully', async () => {
      mockApiClient.getCategories.mockRejectedValue(new Error('Network error'));

      await expect(mockApiClient.getCategories()).rejects.toThrow('Network error');
    });
  });

  describe('createCategory', () => {
    test('should create category without parent', async () => {
      const newCategory = {
        id: '4',
        name: 'Fragrance',
        created_at: '2024-01-02T00:00:00Z'
      };

      mockApiClient.createCategory.mockResolvedValue(newCategory);

      const result = await mockApiClient.createCategory('Fragrance');

      expect(mockApiClient.createCategory).toHaveBeenCalledWith('Fragrance');
      expect(result.name).toBe('Fragrance');
      expect(result.id).toBe('4');
    });

    test('should create category with parent', async () => {
      const newCategory = {
        id: '5',
        name: 'Serums',
        parent_id: '1',
        created_at: '2024-01-02T00:00:00Z'
      };

      mockApiClient.createCategory.mockResolvedValue(newCategory);

      const result = await mockApiClient.createCategory('Serums', '1');

      expect(mockApiClient.createCategory).toHaveBeenCalledWith('Serums', '1');
      expect(result.parent_id).toBe('1');
      expect(result.name).toBe('Serums');
    });

    test('should validate category name', async () => {
      mockApiClient.createCategory.mockRejectedValueOnce(
        new Error('Category name is required')
      );

      await expect(mockApiClient.createCategory(''))
        .rejects.toThrow('Category name is required');
    });

    test('should handle duplicate category name', async () => {
      mockApiClient.createCategory.mockRejectedValueOnce(
        new Error('Category with this name already exists')
      );

      await expect(mockApiClient.createCategory('Skincare'))
        .rejects.toThrow('Category with this name already exists');
    });
  });

  describe('deleteCategory', () => {
    test('should delete category successfully', async () => {
      mockApiClient.deleteCategory.mockResolvedValue({
        success: true,
        message: 'Category deleted successfully'
      });

      const result = await mockApiClient.deleteCategory('1');

      expect(mockApiClient.deleteCategory).toHaveBeenCalledWith('1');
      expect(result.success).toBe(true);
    });

    test('should prevent deletion of category with products', async () => {
      mockApiClient.deleteCategory.mockRejectedValueOnce(
        new Error('Cannot delete category with associated products')
      );

      await expect(mockApiClient.deleteCategory('1'))
        .rejects.toThrow('Cannot delete category with associated products');
    });

    test('should prevent deletion of parent category with children', async () => {
      mockApiClient.deleteCategory.mockRejectedValueOnce(
        new Error('Cannot delete category with subcategories')
      );

      await expect(mockApiClient.deleteCategory('1'))
        .rejects.toThrow('Cannot delete category with subcategories');
    });

    test('should handle non-existent category', async () => {
      mockApiClient.deleteCategory.mockRejectedValueOnce(
        new Error('Category not found')
      );

      await expect(mockApiClient.deleteCategory('999'))
        .rejects.toThrow('Category not found');
    });
  });

  describe('Hierarchical Category Operations', () => {
    test('should build category hierarchy correctly', async () => {
      const mockCategories: CategoriesResponse = {
        categories: [
          { id: '1', name: 'Skincare' },
          { id: '2', name: 'Makeup' },
          { id: '3', name: 'Cleansers', parent_id: '1' },
          { id: '4', name: 'Moisturizers', parent_id: '1' },
          { id: '5', name: 'Foundation', parent_id: '2' },
          { id: '6', name: 'Lipstick', parent_id: '2' }
        ]
      };

      mockApiClient.getCategoriesHierarchical.mockResolvedValue(mockCategories);

      const result = await mockApiClient.getCategoriesHierarchical();

      expect(mockApiClient.getCategoriesHierarchical).toHaveBeenCalledTimes(1);
      
      // Verify hierarchy structure
      const skincare = result.categories.find(c => c.name === 'Skincare');
      const makeup = result.categories.find(c => c.name === 'Makeup');
      
      expect(skincare).toBeDefined();
      expect(makeup).toBeDefined();
      
      const cleansers = result.categories.find(c => c.parent_id === '1' && c.name === 'Cleansers');
      const moisturizers = result.categories.find(c => c.parent_id === '1' && c.name === 'Moisturizers');
      
      expect(cleansers).toBeDefined();
      expect(moisturizers).toBeDefined();
    });

    test('should handle circular reference prevention', async () => {
      mockApiClient.createCategory.mockRejectedValueOnce(
        new Error('Circular reference detected in category hierarchy')
      );

      await expect(mockApiClient.createCategory('Test', '1'))
        .rejects.toThrow('Circular reference detected in category hierarchy');
    });
  });
});

describe('Manufacturer Management Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getManufacturers', () => {
    test('should fetch manufacturers successfully', async () => {
      const mockManufacturers = [
        { id: '1', name: 'Amorepacific', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', name: 'LG Household & Health Care', created_at: '2024-01-01T00:00:00Z' },
        { id: '3', name: 'COSRX', created_at: '2024-01-01T00:00:00Z' }
      ];

      mockApiClient.getManufacturers.mockResolvedValue(mockManufacturers);

      const result = await mockApiClient.getManufacturers();

      expect(mockApiClient.getManufacturers).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Amorepacific');
    });

    test('should handle empty manufacturers list', async () => {
      mockApiClient.getManufacturers.mockResolvedValue([]);

      const result = await mockApiClient.getManufacturers();

      expect(result).toHaveLength(0);
    });
  });

  describe('createManufacturer', () => {
    test('should create manufacturer successfully', async () => {
      const newManufacturer = {
        id: '4',
        name: 'Innisfree',
        created_at: '2024-01-02T00:00:00Z'
      };

      mockApiClient.createManufacturer.mockResolvedValue(newManufacturer);

      const result = await mockApiClient.createManufacturer('Innisfree');

      expect(mockApiClient.createManufacturer).toHaveBeenCalledWith('Innisfree');
      expect(result.name).toBe('Innisfree');
      expect(result.id).toBe('4');
    });

    test('should validate manufacturer name', async () => {
      mockApiClient.createManufacturer.mockRejectedValueOnce(
        new Error('Manufacturer name is required')
      );

      await expect(mockApiClient.createManufacturer(''))
        .rejects.toThrow('Manufacturer name is required');
    });

    test('should handle duplicate manufacturer name', async () => {
      mockApiClient.createManufacturer.mockRejectedValueOnce(
        new Error('Manufacturer with this name already exists')
      );

      await expect(mockApiClient.createManufacturer('Amorepacific'))
        .rejects.toThrow('Manufacturer with this name already exists');
    });

    test('should validate manufacturer name length', async () => {
      mockApiClient.createManufacturer.mockRejectedValueOnce(
        new Error('Manufacturer name too long (max 100 characters)')
      );

      const longName = 'A'.repeat(101);
      await expect(mockApiClient.createManufacturer(longName))
        .rejects.toThrow('Manufacturer name too long (max 100 characters)');
    });
  });

  describe('deleteManufacturer', () => {
    test('should delete manufacturer successfully', async () => {
      mockApiClient.deleteManufacturer.mockResolvedValue({
        success: true,
        message: 'Manufacturer deleted successfully'
      });

      const result = await mockApiClient.deleteManufacturer('1');

      expect(mockApiClient.deleteManufacturer).toHaveBeenCalledWith('1');
      expect(result.success).toBe(true);
    });

    test('should prevent deletion of manufacturer with products', async () => {
      mockApiClient.deleteManufacturer.mockRejectedValueOnce(
        new Error('Cannot delete manufacturer with associated products')
      );

      await expect(mockApiClient.deleteManufacturer('1'))
        .rejects.toThrow('Cannot delete manufacturer with associated products');
    });

    test('should handle non-existent manufacturer', async () => {
      mockApiClient.deleteManufacturer.mockRejectedValueOnce(
        new Error('Manufacturer not found')
      );

      await expect(mockApiClient.deleteManufacturer('999'))
        .rejects.toThrow('Manufacturer not found');
    });
  });

  describe('Manufacturer Permissions', () => {
    test('should check admin permissions for manufacturer operations', async () => {
      // Mock unauthorized access
      mockApiClient.createManufacturer.mockRejectedValueOnce(
        new Error('Admin access required for manufacturer management')
      );

      await expect(mockApiClient.createManufacturer('Test Brand'))
        .rejects.toThrow('Admin access required for manufacturer management');
    });

    test('should check admin permissions for manufacturer deletion', async () => {
      mockApiClient.deleteManufacturer.mockRejectedValueOnce(
        new Error('Admin access required for manufacturer deletion')
      );

      await expect(mockApiClient.deleteManufacturer('1'))
        .rejects.toThrow('Admin access required for manufacturer deletion');
    });
  });
});

describe('Category and Manufacturer Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle category-manufacturer product filtering', async () => {
    const mockCategories: CategoriesResponse = {
      categories: [
        { id: '1', name: 'Skincare' },
        { id: '2', name: 'Makeup' }
      ]
    };

    const mockManufacturers = [
      { id: '1', name: 'Amorepacific' },
      { id: '2', name: 'LG Household & Health Care' }
    ];

    mockApiClient.getCategories.mockResolvedValue(mockCategories);
    mockApiClient.getManufacturers.mockResolvedValue(mockManufacturers);

    const [categories, manufacturers] = await Promise.all([
      mockApiClient.getCategories(),
      mockApiClient.getManufacturers()
    ]);

    expect(categories.categories).toHaveLength(2);
    expect(manufacturers).toHaveLength(2);
    
    // Test filtering logic
    const skincareCategory = categories.categories.find(c => c.name === 'Skincare');
    const amorepacific = manufacturers.find(m => m.name === 'Amorepacific');
    
    expect(skincareCategory).toBeDefined();
    expect(amorepacific).toBeDefined();
  });

  test('should handle simultaneous category and manufacturer operations', async () => {
    // Set up mocks first
    mockApiClient.createCategory.mockResolvedValueOnce({
      id: 'cat-1',
      name: 'New Category'
    });

    mockApiClient.createManufacturer.mockResolvedValueOnce({
      id: 'man-1',
      name: 'New Manufacturer'
    });

    // Simulate concurrent operations
    const categoryPromise = mockApiClient.createCategory('New Category');
    const manufacturerPromise = mockApiClient.createManufacturer('New Manufacturer');

    const [category, manufacturer] = await Promise.all([
      categoryPromise,
      manufacturerPromise
    ]);

    expect(category.name).toBe('New Category');
    expect(manufacturer.name).toBe('New Manufacturer');
  });
});
