# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-creation.spec.ts >> Product Creation Modal >> should validate required fields
- Location: tests/e2e/product-creation.spec.ts:12:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Create New Product"
Received string:    "Welcome Back"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    9 × locator resolved to <h1 class="mt-4 text-2xl font-bold text-slate-800">Welcome Back</h1>
      - unexpected value "Welcome Back"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - paragraph [ref=e4]: Get 20% OFF on Your First Order!
    - generic [ref=e5]:
      - button "Claim Offer" [ref=e6] [cursor=pointer]
      - button [ref=e7] [cursor=pointer]:
        - img [ref=e8]
  - navigation [ref=e11]:
    - generic [ref=e13]:
      - link "Korea Comestics Hub" [ref=e14] [cursor=pointer]:
        - /url: /
        - img "Korea Comestics Hub" [ref=e16]
      - generic [ref=e17]:
        - link "Shop" [ref=e18] [cursor=pointer]:
          - /url: /shop
        - link "B2B Wholesale" [ref=e19] [cursor=pointer]:
          - /url: /wholesale
        - link "Manufacturers" [ref=e20] [cursor=pointer]:
          - /url: /manufacturers
        - link "About" [ref=e21] [cursor=pointer]:
          - /url: /about
      - generic [ref=e23]:
        - textbox "Search Korean cosmetics..." [ref=e24]
        - img [ref=e25]
      - button "Deliver to 🇰🇪 Kenya" [ref=e29] [cursor=pointer]:
        - img [ref=e30]
        - generic [ref=e33]:
          - paragraph [ref=e34]: Deliver to
          - paragraph [ref=e35]:
            - generic [ref=e36]: 🇰🇪
            - generic [ref=e37]: Kenya
        - img [ref=e38]
      - generic [ref=e40]:
        - link [ref=e41] [cursor=pointer]:
          - /url: /cart
          - img [ref=e42]
        - button [ref=e47] [cursor=pointer]:
          - img [ref=e48]
          - img [ref=e51]
  - generic [ref=e54]:
    - generic [ref=e55]:
      - link "KoreaCosmetics' Hub" [ref=e56] [cursor=pointer]:
        - /url: /
        - img "KoreaCosmetics' Hub" [ref=e58]
      - heading "Welcome Back" [level=1] [ref=e59]
      - paragraph [ref=e60]: Sign in to your KoreaCosmetics' Hub account
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]: Email Address
          - generic [ref=e65]:
            - img [ref=e66]
            - textbox "you@example.com" [ref=e69]
        - generic [ref=e70]:
          - generic [ref=e71]: Password
          - generic [ref=e72]:
            - img [ref=e73]
            - textbox "••••••••" [ref=e76]
            - button [ref=e77] [cursor=pointer]:
              - img [ref=e78]
        - generic [ref=e81]:
          - generic [ref=e82] [cursor=pointer]:
            - checkbox "Remember me" [ref=e83]
            - generic [ref=e84]: Remember me
          - link "Forgot password?" [ref=e85] [cursor=pointer]:
            - /url: /forgot-password
        - button "Sign In" [ref=e86] [cursor=pointer]:
          - generic [ref=e87]: Sign In
          - img [ref=e88]
      - generic [ref=e94]: OR continue with
      - generic [ref=e95]:
        - button "Continue with Google" [ref=e96] [cursor=pointer]:
          - img [ref=e97]
          - generic [ref=e102]: Continue with Google
        - button "Continue with GitHub" [ref=e103] [cursor=pointer]:
          - img [ref=e104]
          - generic [ref=e106]: Continue with GitHub
      - paragraph [ref=e107]:
        - text: Don't have an account?
        - link "Create account" [ref=e108] [cursor=pointer]:
          - /url: /register?redirect=/admin/products/create
    - link "← Back to home" [ref=e110] [cursor=pointer]:
      - /url: /
  - contentinfo [ref=e111]:
    - generic [ref=e112]:
      - generic [ref=e113]:
        - generic [ref=e114]:
          - link "KoreaCosmetics' Hub Logo" [ref=e115] [cursor=pointer]:
            - /url: /
            - img "KoreaCosmetics' Hub Logo" [ref=e117]
          - paragraph [ref=e118]: Welcome to KoreaCosmetics' Hub, your trusted gateway to authentic Korean cosmetics. Based in Kenya, we connect African retailers and distributors with premium K-beauty products through our B2B wholesale platform.
          - generic [ref=e119]:
            - link [ref=e120] [cursor=pointer]:
              - /url: https://www.facebook.com
              - img [ref=e121]
            - link [ref=e123] [cursor=pointer]:
              - /url: https://www.instagram.com
              - img [ref=e124]
            - link [ref=e126] [cursor=pointer]:
              - /url: https://twitter.com
              - img [ref=e127]
            - link [ref=e129] [cursor=pointer]:
              - /url: https://www.linkedin.com
              - img [ref=e130]
        - generic [ref=e134]:
          - generic [ref=e135]:
            - heading "PRODUCTS" [level=3] [ref=e136]
            - list [ref=e137]:
              - listitem [ref=e138]:
                - link "Skincare" [ref=e139] [cursor=pointer]:
                  - /url: /shop
              - listitem [ref=e140]:
                - link "Makeup" [ref=e141] [cursor=pointer]:
                  - /url: /shop
              - listitem [ref=e142]:
                - link "Hair Care" [ref=e143] [cursor=pointer]:
                  - /url: /shop
              - listitem [ref=e144]:
                - link "Body Care" [ref=e145] [cursor=pointer]:
                  - /url: /shop
          - generic [ref=e146]:
            - heading "WEBSITE" [level=3] [ref=e147]
            - list [ref=e148]:
              - listitem [ref=e149]:
                - link "Home" [ref=e150] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e151]:
                - link "About Us" [ref=e152] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e153]:
                - link "B2B Wholesale" [ref=e154] [cursor=pointer]:
                  - /url: /wholesale
              - listitem [ref=e155]:
                - link "Manufacturers" [ref=e156] [cursor=pointer]:
                  - /url: /manufacturers
          - generic [ref=e157]:
            - heading "CONTACT" [level=3] [ref=e158]
            - list [ref=e159]:
              - listitem [ref=e160]:
                - img [ref=e161]
                - link "+254-712-345-678" [ref=e163] [cursor=pointer]:
                  - /url: tel:+254712345678
              - listitem [ref=e164]:
                - img [ref=e165]
                - link "info@KoreaCosmetics'hub.com" [ref=e167] [cursor=pointer]:
                  - /url: mailto:info@KoreaCosmetics'hub.com
              - listitem [ref=e168]:
                - img [ref=e169]
                - link "Nairobi, Kenya" [ref=e172] [cursor=pointer]:
                  - /url: /contact
      - paragraph [ref=e173]: Copyright 2025 © KoreaCosmetics' Hub All Right Reserved.
  - alert [ref=e174]
  - button "Open Next.js Dev Tools" [ref=e180] [cursor=pointer]:
    - img [ref=e181]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Product Creation Modal', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Navigate directly to create product page
  6   |     await page.goto('/admin/products/create');
  7   |     
  8   |     // Wait for the create product page to load
> 9   |     await expect(page.locator('h1')).toContainText('Create New Product');
      |                                      ^ Error: expect(locator).toContainText(expected) failed
  10  |   });
  11  | 
  12  |   test('should validate required fields', async ({ page }) => {
  13  |     // Try to submit form without filling required fields
  14  |     await page.click('button[type="submit"]');
  15  |     
  16  |     // Should show validation error
  17  |     await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  18  |   });
  19  | 
  20  |   test('should create product with valid data', async ({ page }) => {
  21  |     // Fill in required fields
  22  |     await page.fill('input[name="name"]', 'Test Product');
  23  |     await page.fill('input[name="price"]', '29.99');
  24  |     await page.fill('textarea[name="description"]', 'This is a test product description');
  25  |     
  26  |     // Select category
  27  |     await page.selectOption('select[name="category"]', { label: 'Skincare' });
  28  |     
  29  |     // Fill optional fields
  30  |     await page.fill('input[name="brand"]', 'Test Brand');
  31  |     await page.fill('input[name="manufacturer"]', 'Test Manufacturer');
  32  |     await page.fill('input[name="origin"]', 'Korea');
  33  |     await page.fill('input[name="stock_quantity"]', '100');
  34  |     
  35  |     // Submit form
  36  |     await page.click('button[type="submit"]');
  37  |     
  38  |     // Should redirect to products page and show success message
  39  |     await expect(page).toHaveURL('/admin/products');
  40  |     await expect(page.locator('text=Product created successfully!')).toBeVisible();
  41  |   });
  42  | 
  43  |   test('should handle image upload successfully', async ({ page }) => {
  44  |     // Fill in required fields first
  45  |     await page.fill('input[name="name"]', 'Product with Image');
  46  |     await page.fill('input[name="price"]', '39.99');
  47  |     await page.fill('textarea[name="description"]', 'Product with image test');
  48  |     
  49  |     // Upload image
  50  |     const fileInput = page.locator('input[type="file"]');
  51  |     await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
  52  |     
  53  |     // Wait for upload to complete
  54  |     await expect(page.locator('text=Images uploaded successfully')).toBeVisible({ timeout: 10000 });
  55  |     
  56  |     // Verify image preview
  57  |     await expect(page.locator('img[alt*="Product image"]')).toBeVisible();
  58  |     
  59  |     // Submit form
  60  |     await page.click('button[type="submit"]');
  61  |     
  62  |     // Should succeed
  63  |     await expect(page).toHaveURL('/admin/products');
  64  |   });
  65  | 
  66  |   test('should handle image upload failure', async ({ page }) => {
  67  |     // Mock upload failure
  68  |     await page.route('**/api/products/upload', route => {
  69  |       route.fulfill({
  70  |         status: 500,
  71  |         contentType: 'application/json',
  72  |         body: JSON.stringify({ error: 'Upload failed' })
  73  |       });
  74  |     });
  75  |     
  76  |     // Fill in required fields
  77  |     await page.fill('input[name="name"]', 'Product with Failed Upload');
  78  |     await page.fill('input[name="price"]', '49.99');
  79  |     await page.fill('textarea[name="description"]', 'Test upload failure');
  80  |     
  81  |     // Try to upload image
  82  |     const fileInput = page.locator('input[type="file"]');
  83  |     await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
  84  |     
  85  |     // Should show error message
  86  |     await expect(page.locator('text=Failed to upload images')).toBeVisible({ timeout: 10000 });
  87  |   });
  88  | 
  89  |   test('should sync with warehouse selection', async ({ page }) => {
  90  |     // Fill in required fields
  91  |     await page.fill('input[name="name"]', 'Warehouse Sync Product');
  92  |     await page.fill('input[name="price"]', '59.99');
  93  |     await page.fill('textarea[name="description"]', 'Testing warehouse sync');
  94  |     
  95  |     // Mock warehouse API
  96  |     await page.route('**/api/warehouse/**', route => {
  97  |       route.fulfill({
  98  |         status: 200,
  99  |         contentType: 'application/json',
  100 |         body: JSON.stringify({ 
  101 |           warehouses: [
  102 |             { id: '1', name: 'Main Warehouse', location: 'Seoul' },
  103 |             { id: '2', name: 'Secondary Warehouse', location: 'Busan' }
  104 |           ]
  105 |         })
  106 |       });
  107 |     });
  108 |     
  109 |     // Select warehouse if available
```