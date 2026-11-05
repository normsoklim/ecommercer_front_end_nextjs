'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/app/lib/cart-context';
import { useAuth } from '@/app/lib/auth-context';
import { useCartDrawer } from '@/app/components/cart/CartDrawerContext';
import type { ProductVariant } from '@/app/lib/api-types';

interface ProductPurchasePanelProps {
  productId: string;
  variants?: ProductVariant[];
  maxQuantity?: number;
}

/**
 * The buy box of a product: variant picker, quantity stepper and the button
 * that puts the product into the cart of the signed in customer.
 */
export default function ProductPurchasePanel({
  productId,
  variants,
  maxQuantity = 10,
}: ProductPurchasePanelProps) {
  const t = useTranslations("ProductPurchasePanel");
  const { addItem, isAuthenticated } = useCart();
  const { isLoading: authLoading } = useAuth();
  const { open: openCartDrawer } = useCartDrawer();

  const activeVariants = (variants ?? []).filter((variant) => variant.isActive);
  const [variantId, setVariantId] = useState<string | undefined>(
    activeVariants.length === 1 ? activeVariants[0].id : undefined,
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleAdd = async () => {
    setIsAdding(true);
    setMessage(null);

    try {
      await addItem({ productId, variantId, quantity });
      setMessage({ type: 'success', text: t("addedToCart") });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : t("couldNotAdd"),
      });
    } finally {
      setIsAdding(false);
    }
  };

  const selectedVariant = activeVariants.find(
    (variant) => variant.id === variantId,
  );
  const availableStock = selectedVariant
    ? selectedVariant.stockQuantity
    : maxQuantity;
  const canIncrease = quantity < Math.min(maxQuantity, Math.max(availableStock, 1));

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-background p-5">
        <p className="text-sm font-semibold text-foreground">
          {t("signInToAdd")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("cartLinked")}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background transition-colors hover:bg-primary"
        >
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {activeVariants.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("variants")}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeVariants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                aria-pressed={variantId === variant.id}
                className={
                  variantId === variant.id
                    ? 'rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
                    : 'rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:border-primary'
                }
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground">{t("quantity")}</h3>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || isAdding}
            aria-label={t("decreaseQuantity")}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus size={16} />
          </button>
          <span className="flex h-12 w-16 items-center justify-center text-lg font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            disabled={!canIncrease || isAdding}
            aria-label={t("increaseQuantity")}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isAdding ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ShoppingCart size={18} />
          )}
          {isAdding ? t("adding") : t("addToCart")}
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={
            message.type === 'success'
              ? 'mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400'
              : 'mt-3 text-sm font-medium text-rose-600 dark:text-rose-400'
          }
        >
          {message.type === 'success' && <Check size={16} />}
          {message.text}
          {message.type === 'success' && (
            <button
              type="button"
              onClick={openCartDrawer}
              className="font-semibold text-indigo-600 dark:text-indigo-400 underline"
            >
              {t("viewCart")}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
