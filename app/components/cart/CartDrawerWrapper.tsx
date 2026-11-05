'use client';

import SiteHeader from "@/app/components/storefront/site-header";
import { CartDrawerProvider, useCartDrawer } from "@/app/components/cart/CartDrawerContext";
import type { Category } from "@/app/lib/api-types";

interface CartDrawerWrapperProps {
  categories: Category[];
  children: React.ReactNode;
}

function CartDrawerContent({ categories }: { categories: Category[] }) {
  const { open } = useCartDrawer();

  return (
    <SiteHeader
      categories={categories}
      onCartClick={open}
    />
  );
}

export function CartDrawerWrapper({ categories, children }: CartDrawerWrapperProps) {
  return (
    <CartDrawerProvider>
      <CartDrawerContent categories={categories} />
      {children}
    </CartDrawerProvider>
  );
}
