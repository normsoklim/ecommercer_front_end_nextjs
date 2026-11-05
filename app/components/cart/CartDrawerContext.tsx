'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { CartDrawer } from '@/app/components/cart/CartDrawer';

interface CartDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

/**
 * Provides the cart drawer state (open/close) and renders the cart drawer
 * sidebar. Any component can call useCartDrawer() to open the drawer instead
 * of navigating to the (removed) /cart page.
 */
export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <CartDrawerContext.Provider value={{ isOpen, open, close }}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={close} />
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);

  if (context === undefined) {
    throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  }

  return context;
}
