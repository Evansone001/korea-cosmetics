/**
 * useCartPath Hook
 * Custom hook for dynamic cart routing based on user role and context
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { getCartPath, navigateToCart, type CartPathConfig, type CartType } from '@/lib/utils/cartRouting';

export function useCartPath() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector(state => state?.auth || { user: null, isAuthenticated: false });

  const cartConfig: CartPathConfig = useMemo(() => {
    return getCartPath(user?.role);
  }, [user?.role]);

  const navigateToCartPage = () => {
    navigateToCart(user?.role, router);
  };

  return {
    cartPath: cartConfig.path,
    cartType: cartConfig.type,
    cartLabel: cartConfig.label,
    navigateToCart: navigateToCartPage,
    userRole: user?.role,
    isAuthenticated
  };
}
