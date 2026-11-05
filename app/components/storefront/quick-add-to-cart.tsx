'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/app/lib/cart-context';
import { useAuth } from '@/app/lib/auth-context';
import type { ProductVariant } from '@/app/lib/api-types';

interface QuickAddToCartProps {
  productId: string;
  productName: string;
  variants?: ProductVariant[];
}

export default function QuickAddToCart({
  productId,
  productName,
  variants,
}: QuickAddToCartProps) {
  const t = useTranslations("QuickAddToCart");
  const { addItem, isAdding, isAuthenticated } = useCart();
  const { isLoading: authLoading } = useAuth();

  const [state, setState] = useState<'idle' | 'added'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeVariants = (variants ?? []).filter((variant) => variant.isActive);
  const variantId =
    activeVariants.length === 1 ? activeVariants[0].id : undefined;

  const isAddingThisProduct = isAdding(productId);

  const handleClick = async () => {
    setError(null);

    try {
      await addItem({ productId, variantId, quantity: 1 });
      setState('added');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("couldNotAdd"),
      );
    }
  };

  // Only show the sign-in message after the client has mounted, to avoid
  // hydration mismatches (server renders isAuthenticated=null, authLoading=true).
  if (mounted && !isAuthenticated && !authLoading) {
    return (
      <p className="px-4 py-2 text-xs font-medium text-slate-500">
        {t("signInToAdd")}
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isAddingThisProduct || state === 'added'}
        aria-label={`Add ${productName} to cart`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isAddingThisProduct ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === 'added' ? (
          <Check size={16} />
        ) : (
          <ShoppingBag size={16} />
        )}
        {isAddingThisProduct
          ? t("adding")
          : state === 'added'
            ? t("added")
            : t("addToCart")}
      </button>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
