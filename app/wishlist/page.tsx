'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Heart,
  Loader2,
  Trash2,
} from 'lucide-react';
import { LoadingState } from '@/app/components/storefront/loading-state';
import { useWishlist } from '@/app/lib/wishlist-context';
import { useAuth } from '@/app/lib/auth-context';

const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

function WishlistLineImage({
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

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    itemCount,
    isLoading,
    error,
    removeItem,
    clearError,
  } = useWishlist();

  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setPendingItemId(productId);

    try {
      await removeItem(productId);
    } catch {
      // The error is already stored in the wishlist context.
    } finally {
      setPendingItemId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <LoadingState
        isLoading={true}
        error={null}
        data={null}
        loadingMessage="Loading your wishlist..."
        spinnerSize={16}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50/60 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Heart size={30} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Sign in to see your wishlist
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your wishlist is linked to your account.
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
          Wishlist
        </h1>

        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
          <Heart size={48} className="text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Your wishlist is empty
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
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>
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
                  <WishlistLineImage
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
                        {product?.sku ?? ''}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-950">
                      {money(product?.basePrice ?? 0)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        Added to wishlist
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${product?.name ?? 'item'} from wishlist`}
                        onClick={() => handleRemove(item.productId)}
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
          <h2 className="text-lg font-bold text-slate-950">Wishlist summary</h2>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-950">
              {money(
                items.reduce(
                  (total, item) => total + (item.product?.basePrice ?? 0),
                  0,
                ),
              )}
            </span>
          </div>

          <Link
            href="/products"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Continue shopping
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
