'use client';

import type { CartItem } from '@/app/lib/api-types';
import { useCartDrawer } from '@/app/components/cart/CartDrawerContext';

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency?: string;
  title?: string;
};

const money = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount / (currency === 'USD' ? 100 : 1));

export default function OrderSummary({
  items,
  subtotal,
  taxAmount,
  shippingAmount,
  totalAmount,
  currency = 'USD',
  title = 'Order summary',
}: OrderSummaryProps) {
  const { open: openCartDrawer } = useCartDrawer();
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>

      {items.length > 0 && (
        <ul className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">
                  {item.product?.name ?? 'Product'}
                  {item.variant?.name ? (
                    <span className="text-slate-500"> · {item.variant.name}</span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500">
                  {money(item.unitPrice, currency)} × {item.quantity}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-slate-900">
                {money(item.unitPrice * item.quantity, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <dt>Subtotal</dt>
          <dd className="font-semibold text-slate-900">
            {money(subtotal, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <dt>Tax</dt>
          <dd className="font-semibold text-slate-900">
            {money(taxAmount, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <dt>Shipping</dt>
          <dd className="font-semibold text-slate-900">
            {shippingAmount > 0
              ? money(shippingAmount, currency)
              : 'Free'}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="text-sm font-semibold text-slate-900">Total</span>
        <span className="text-xl font-bold text-slate-950">
          {money(totalAmount, currency)}
        </span>
      </div>

      <button
        type="button"
        onClick={openCartDrawer}
        className="mt-6 flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        Back to cart
      </button>
    </aside>
  );
}
