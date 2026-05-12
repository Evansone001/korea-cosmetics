/**
 * Cart Routing Utility
 * Centralized logic for determining cart paths based on user role and context
 */

export type CartType = 'b2c' | 'b2b' | 'wholesale';

export interface CartPathConfig {
  path: string;
  type: CartType;
  label: string;
}

/**
 * Get the appropriate cart path based on user role
 * @param userRole - The user's role (customer, seller, admin, etc.)
 * @returns CartPathConfig with path, type, and label
 */
export function getCartPath(userRole?: string | null): CartPathConfig {
  // Seller/Reseller users use wholesale cart
  if (userRole === 'seller' || userRole === 'reseller') {
    return {
      path: '/store/wholesale/cart',
      type: 'wholesale',
      label: 'Wholesale Cart'
    };
  }

  // Admin users can access both, default to B2C for now
  if (userRole === 'admin' || userRole === 'super_admin') {
    return {
      path: '/cart',
      type: 'b2c',
      label: 'Cart'
    };
  }

  // Default to B2C cart for customers and unauthenticated users
  return {
    path: '/cart',
    type: 'b2c',
    label: 'Cart'
  };
}

/**
 * Navigate to the appropriate cart page
 * @param userRole - The user's role
 * @param router - Next.js router instance
 */
export function navigateToCart(userRole: string | null | undefined, router: any) {
  const config = getCartPath(userRole);
  router.push(config.path);
}

/**
 * Check if the current path is a cart page
 * @param pathname - Current pathname
 * @returns boolean indicating if on a cart page
 */
export function isCartPage(pathname: string): boolean {
  return pathname === '/cart' || pathname === '/store/wholesale/cart';
}

/**
 * Get cart type from current pathname
 * @param pathname - Current pathname
 * @returns CartType or null if not on cart page
 */
export function getCartTypeFromPath(pathname: string): CartType | null {
  if (pathname === '/cart') return 'b2c';
  if (pathname === '/store/wholesale/cart') return 'wholesale';
  return null;
}
