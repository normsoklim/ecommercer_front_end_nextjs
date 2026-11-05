'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@/app/lib/cart-context';
import { useAuth } from '@/app/lib/auth-context';

const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    clearError,
  } = useCart();

  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const changeQuantity = async (itemId: string, quantity: number) => {
    setPendingItemId(itemId);
    try {
      await updateQuantity(itemId, quantity);
    } catch {
      // Error already stored in cart context.
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setPendingItemId(itemId);
    try {
      await removeItem(itemId);
    } catch {
      // Error already stored in cart context.
    } finally {
      setPendingItemId(null);
    }
  };

  const drawerPanel = (
    <div className="fixed right-0 top-0 h-screen max-w-md bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-950">
            Your cart ({itemCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="text-xs font-medium text-indigo-600 hover:underline"
            onClick={onClose}
          >
            Continue shopping
            <ArrowRight size={14} className="ml-1" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-950"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="ml-2 font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <ShoppingBag size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Add some products to get started
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              onClick={onClose}
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const product = item.product;
              const imageUrl = product?.images?.find(
                (image) => image.isPrimary,
              )?.url;

              return (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Link href={`/product/${product?.slug ?? ''}`}>
                    <div className="shrink-0 h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product?.name ?? 'Product'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product?.slug ?? ''}`}
                      className="block truncate text-sm font-semibold text-slate-950 hover:text-indigo-600"
                    >
                      {product?.name ?? 'Product'}
                    </Link>
                    {item.variant?.name && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {money(item.unitPrice * item.quantity)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={
                          item.quantity <= 1 ||
                          pendingItemId === item.id
                        }
                        onClick={() =>
                          changeQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-slate-900"
                      >
                        {pendingItemId === item.id ? (
                          <span className="animate-pulse">…</span>
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
                        className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${product?.name ?? 'item'}`}
                    onClick={() => handleRemove(item.id)}
                    disabled={pendingItemId === item.id}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-900 mb-6">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Shipping and taxes calculated at checkout.
        </p>

        <Link
          href="/checkout"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          onClick={onClose}
        >
          Checkout
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );

  if (authLoading || isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        {drawerPanel}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        {drawerPanel}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      {drawerPanel}
    </div>
  );
}
