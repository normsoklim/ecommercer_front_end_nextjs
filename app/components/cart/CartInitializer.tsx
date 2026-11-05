'use client';

import { useEffect } from 'react';
import { useCart } from '@/app/lib/cart-context';
import { useAuth } from '@/app/lib/auth-context';

export function CartInitializer() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refresh } = useCart();

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    void refresh();
  }, [refresh, isAuthenticated, authLoading]);

  return null;
}
