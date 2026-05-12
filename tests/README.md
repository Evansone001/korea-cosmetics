# Catalog Functionality Testing Guide

This document provides comprehensive testing guidelines and instructions for the Korea Cosmetics catalog functionality.

## Overview

The testing suite covers all major catalog features including:
- Product creation, editing, and deletion
- Category and manufacturer management
- Warehouse integration and stock management
- Image upload functionality
- Search and filtering capabilities

## Testing Framework Setup

### Prerequisites

Ensure you have the following dependencies installed:
```bash
npm install --save-dev @playwright/test @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @types/jest @tanstack/react-query
```

### Configuration Files

- `playwright.config.ts` - Playwright E2E testing configuration
- `jest.config.js` - Jest unit testing configuration  
- `jest.setup.js` - Jest setup with mocks and environment variables

## Test Categories

### 1. E2E Tests (`/tests/e2e/`)

End-to-end tests that simulate real user interactions in a browser environment.

#### Product Creation Modal Tests
**File:** `product-creation.spec.ts`

**Coverage:**
- Required fields validation
- Image upload success/failure scenarios
- Warehouse selection synchronization
- Concurrent edit conflict handling
- Price format validation
- Category loading and selection

**Running E2E Tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/product-creation.spec.ts
```

### 2. Integration Tests (`/tests/integration/`)

Tests that verify API integration and data flow between components.

#### Warehouse Integration Tests
**File:** `warehouse-integration.test.ts`

**Coverage:**
- Stock management (increment/decrement)
- Invalid warehouse ID handling
- Product warehouse operations
- Warehouse catalog operations
- Store purchase from warehouse

**Running Integration Tests:**
```bash
# Run all integration tests
npm test tests/integration/

# Run specific integration test
npm test tests/integration/warehouse-integration.test.ts
```

### 3. Unit Tests (`/tests/unit/`)

Isolated tests for individual functions and components.

#### Category & Manufacturer Management Tests
**File:** `category-manufacturer.test.ts`

**Coverage:**
- Category CRUD operations
- Manufacturer CRUD operations
- Hierarchical category operations
- Permission validation
- Concurrent operations

#### Image Upload Tests
**File:** `image-upload.test.ts`

**Coverage:**
- Successful image uploads (JPEG, PNG, WebP)
- File size validation (5MB limit)
- Format validation
- Error handling
- Multiple concurrent uploads
- Image compression and thumbnails
- Security validation

**Running Unit Tests:**
```bash
# Run all unit tests
npm test tests/unit/

# Run specific unit test
npm test tests/unit/category-manufacturer.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode for development
npm run test:watch
```

## Test Data and Fixtures

### Sample Data (`/tests/fixtures/`)

**File:** `sample-data.ts`

Contains mock data for:
- Categories (hierarchical structure)
- Manufacturers
- Products (with complete attributes)
- Warehouses
- Orders
- Images
- Test scenarios (valid/invalid cases)

### Using Test Fixtures

```typescript
import { mockCategories, mockProducts, testScenarios } from '../fixtures/sample-data';

// Use in tests
test('should handle valid product creation', async () => {
  const validProduct = testScenarios.validProductCreation;
  // Test implementation
});
```

## Test Matrix Implementation

The following test matrix has been implemented:

| Feature | Test Cases | Status |
|---------|------------|---------|
| Product creation modal | ✅ Required fields validation<br>✅ Image upload success/failure<br>✅ Warehouse selection sync<br>✅ Concurrent edit conflict | Completed |
| Product editing | 🔄 Pre‑fill existing data<br>🔄 Update partial fields<br>🔄 Concurrent edit conflict | Partially implemented |
| Product deletion | ✅ Soft delete vs hard delete<br>✅ Cascade checks | Completed |
| Warehouse integration | ✅ Stock increment/decrement<br>✅ Invalid warehouse ID handling | Completed |
| Category & manufacturer management | ✅ Hierarchical category selection<br>✅ Manufacturer CRUD permissions | Completed |
| Image upload | ✅ File size limits, format validation<br>✅ Image preview compression | Completed |
| Filtering & search | 🔄 Text search, category filter<br>🔄 Price range – combined filters | Pending |
| Stock tracking & status | ✅ Low stock threshold alerts<br>✅ Out‑of‑stock badge display | Completed |

## API Mocking Strategy

### Jest Mocks

All API calls are mocked using Jest to ensure consistent test results:

```typescript
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock specific methods
mockApiClient.getCategories.mockResolvedValue(mockCategories);
mockApiClient.createProduct.mockRejectedValue(new Error('Creation failed'));
```

### Playwright Route Mocking

For E2E tests, use route mocking to simulate API responses:

```typescript
// Mock categories API
await page.route('**/api/categories', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ categories: mockCategories })
  });
});
```

## Running Tests in Different Environments

### Development Environment
```bash
# Start development server
npm run dev

# Run tests in parallel
npm test
```

### CI/CD Environment
```bash
# Install dependencies
npm ci

# Run all tests
npm run test:e2e
npm test

# Generate coverage report
npm run test:coverage
```

### Docker Environment
```bash
# Build test container
docker build -t korea-cosmetics-tests .

# Run tests
docker run korea-cosmetics-tests npm test
```

## Test Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern

### 2. Mock Management
- Clear mocks before each test using `beforeEach`
- Use consistent mock data from fixtures
- Test both success and failure scenarios

### 3. Assertion Strategy
- Use specific assertions rather than generic ones
- Test edge cases and boundary conditions
- Verify both happy path and error paths

### 4. Test Data Management
- Use fixtures for consistent test data
- Avoid hardcoding values in tests
- Create reusable test scenarios

## Debugging Tests

### Unit Test Debugging
```bash
# Run with debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with logs
DEBUG=* npm test -- specific-test-file.test.ts
```

### E2E Test Debugging
```bash
# Run with browser UI
npx playwright test --ui

# Run with headed mode (visible browser)
npx playwright test --headed

# Generate trace for debugging
npx playwright test --trace on
```

## Coverage Requirements

Target coverage metrics:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

Generate coverage report:
```bash
npm run test:coverage
```

View detailed coverage report:
```bash
open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
      - run: npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Test Timeout Issues**
   - Increase timeout in Jest config
   - Check for async operations not properly awaited

2. **Mock Not Working**
   - Verify mock is properly set up before test
   - Clear mocks in beforeEach

3. **E2E Test Flakiness**
   - Use proper waits and assertions
   - Avoid hard-coded delays
   - Use Playwright's auto-waiting features

4. **TypeScript Errors in Tests**
   - Ensure proper type definitions for mocks
   - Use `as any` sparingly and with justification

### Getting Help

- Check test logs for specific error messages
- Use browser dev tools for E2E debugging
- Review Jest configuration for setup issues
- Consult Playwright documentation for browser-specific issues

## Future Enhancements

### Planned Test Additions
- Visual regression testing
- Performance testing
- Accessibility testing
- Mobile-responsive testing
- Cross-browser compatibility testing

### Test Automation Improvements
- Parallel test execution
- Smart test selection based on code changes
- Automated test data generation
- Integration with test management tools

---

For questions or issues related to testing, please refer to the development team or create an issue in the project repository.
