'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/app/lib/cart-context';

interface CartBadgeProps {
  onClick?: () => void;
}

export function CartBadge({ onClick }: CartBadgeProps) {
  const { itemCount, isAuthenticated } = useCart();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={`Shopping cart, ${itemCount} items`}
      className="relative inline-flex items-center"
      onClick={onClick}
    >
      <ShoppingCart size={20} className="text-slate-700" />

      {itemCount > 0 && (
        <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
