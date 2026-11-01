'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Loader2,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
} from 'lucide-react';
import { LoadingState } from '@/app/components/storefront/loading-state';
import { useCart } from '@/app/lib/cart-context';
import { useAuth } from '@/app/lib/auth-context';

const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

function CartLineImage({
  url,
  name,
}: {
  url?: string;
  name: string;
}) {
  return (
    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
          No image
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    clear,
    clearError,
  } = useCart();

  // The item that is currently being changed, it shows a spinner on the line.
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const changeQuantity = async (itemId: string, quantity: number) => {
    setPendingItemId(itemId);

    try {
      await updateQuantity(itemId, quantity);
    } catch {
      // The error is already stored in the cart context.
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setPendingItemId(itemId);

    try {
      await removeItem(itemId);
    } catch {
      // The error is already stored in the cart context.
    } finally {
      setPendingItemId(null);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);

    try {
      await clear();
    } catch {
      // The error is already stored in the cart context.
    } finally {
      setIsClearing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <LoadingState
        isLoading={true}
        error={null}
        data={null}
        loadingMessage="Loading your cart..."
        spinnerSize={16}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50/60 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShoppingBag size={30} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Sign in to see your cart
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your cart is linked to your account.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
          >
            Sign in
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Shopping Cart
        </h1>

        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
          <ShoppingBag size={48} className="text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Add some products to get started
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Shopping Cart
          </h1> 
          <p className="mt-2 text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={isClearing}
          className="text-sm font-semibold text-slate-500 underline hover:text-rose-600 disabled:opacity-60"
        >
          Empty cart
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => {
            const product = item.product;
            const imageUrl = product?.images?.find(
              (image) => image.isPrimary,
            )?.url;

            return (
              <li
                key={item.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <Link href={`/product/${product?.slug ?? ''}`}>
                  <CartLineImage
                    url={imageUrl}
                    name={product?.name ?? 'Product'}
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${product?.slug ?? ''}`}
                        className="block truncate text-sm font-bold text-slate-950 hover:text-indigo-600"
                      >
                        {product?.name ?? 'Product'}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.variant?.name
                          ? `${item.variant.name} · `
                          : ''}
                        {product?.sku ?? ''}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-950">
                      {money(item.unitPrice * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1 || pendingItemId === item.id}
                        onClick={() =>
                          changeQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold text-slate-900">
                        {pendingItemId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={pendingItemId === item.id}
                        onClick={() =>
                          changeQuantity(item.id, item.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        {money(item.unitPrice)} each
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${product?.name ?? 'item'}`}
                        onClick={() => handleRemove(item.id)}
                        disabled={pendingItemId === item.id}
                        className="text-slate-400 transition-colors hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-950">Order summary</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-slate-900">
                {money(subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <dt>Shipping</dt>
              <dd className="font-semibold text-slate-900">Calculated at checkout</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-950">
              {money(subtotal)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Checkout
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/products"
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
