import { test, expect } from '@playwright/test';

test.describe('Product Creation Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to store add product page
    await page.goto('/store/add-product');
    
    // Wait for the add product page to load
    await expect(page.locator('h1')).toContainText('Add New Product');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit form without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });

  test('should create product with valid data', async ({ page }) => {
    // Fill in required fields
    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('input[name="price"]', '29.99');
    await page.fill('textarea[name="description"]', 'This is a test product description');
    
    // Select category
    await page.selectOption('select[name="category"]', { label: 'Skincare' });
    
    // Fill optional fields
    await page.fill('input[name="brand"]', 'Test Brand');
    await page.fill('input[name="manufacturer"]', 'Test Manufacturer');
    await page.fill('input[name="origin"]', 'Korea');
    await page.fill('input[name="stock_quantity"]', '100');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to products page and show success message
    await expect(page).toHaveURL('/admin/products');
    await expect(page.locator('text=Product created successfully!')).toBeVisible();
  });

  test('should handle image upload successfully', async ({ page }) => {
    // Fill in required fields first
    await page.fill('input[name="name"]', 'Product with Image');
    await page.fill('input[name="price"]', '39.99');
    await page.fill('textarea[name="description"]', 'Product with image test');
    
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
    
    // Wait for upload to complete
    await expect(page.locator('text=Images uploaded successfully')).toBeVisible({ timeout: 10000 });
    
    // Verify image preview
    await expect(page.locator('img[alt*="Product image"]')).toBeVisible();
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should succeed
    await expect(page).toHaveURL('/admin/products');
  });

  test('should handle image upload failure', async ({ page }) => {
    // Mock upload failure
    await page.route('**/api/products/upload', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upload failed' })
      });
    });
    
    // Fill in required fields
    await page.fill('input[name="name"]', 'Product with Failed Upload');
    await page.fill('input[name="price"]', '49.99');
    await page.fill('textarea[name="description"]', 'Test upload failure');
    
    // Try to upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
    
    // Should show error message
    await expect(page.locator('text=Failed to upload images')).toBeVisible({ timeout: 10000 });
  });

  test('should sync with warehouse selection', async ({ page }) => {
    // Fill in required fields
    await page.fill('input[name="name"]', 'Warehouse Sync Product');
    await page.fill('input[name="price"]', '59.99');
    await page.fill('textarea[name="description"]', 'Testing warehouse sync');
    
    // Mock warehouse API
    await page.route('**/api/warehouse/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          warehouses: [
            { id: '1', name: 'Main Warehouse', location: 'Seoul' },
            { id: '2', name: 'Secondary Warehouse', location: 'Busan' }
          ]
        })
      });
    });
    
    // Select warehouse if available
    const warehouseSelect = page.locator('select[name="warehouse_id"]');
    if (await warehouseSelect.isVisible()) {
      await warehouseSelect.selectOption({ label: 'Main Warehouse' });
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should succeed
    await expect(page).toHaveURL('/admin/products');
  });

  test('should handle concurrent edit conflict', async ({ page }) => {
    // Fill in required fields
    await page.fill('input[name="name"]', 'Concurrent Edit Product');
    await page.fill('input[name="price"]', '69.99');
    await page.fill('textarea[name="description"]', 'Testing concurrent edit');
    
    // Mock conflict response
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Product was modified by another user' })
      });
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show conflict error
    await expect(page.locator('text=Product was modified by another user')).toBeVisible();
  });

  test('should validate price format', async ({ page }) => {
    // Fill in required fields with invalid price
    await page.fill('input[name="name"]', 'Invalid Price Product');
    await page.fill('input[name="price"]', '-10.99'); // Negative price
    await page.fill('textarea[name="description"]', 'Testing price validation');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show validation error or prevent submission
    const priceInput = page.locator('input[name="price"]');
    await expect(priceInput).toHaveValue('-10.99');
    
    // Try with zero price
    await priceInput.fill('0');
    await page.click('button[type="submit"]');
    
    // Should show error for zero or negative price
    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });

  test('should handle category loading', async ({ page }) => {
    // Mock categories API
    await page.route('**/api/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            { id: '1', name: 'Skincare' },
            { id: '2', name: 'Makeup' },
            { id: '3', name: 'Hair Care' }
          ]
        })
      });
    });
    
    // Wait for categories to load
    await expect(page.locator('select[name="category"]')).toBeVisible();
    
    // Verify categories are loaded
    const categoryOptions = page.locator('select[name="category"] option');
    await expect(categoryOptions).toHaveCount(4); // 3 categories + default option
    
    // Select a category
    await page.selectOption('select[name="category"]', 'Skincare');
    await expect(page.locator('select[name="category"]')).toHaveValue('Skincare');
  });
});
