'use client';

import Link from 'next/link';
import { ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

import { useApiLoading } from '../../lib/use-api-loading';
import type { CustomerOrder, PaginatedOrdersResponse } from '../../lib/api-types';
import OrderStatusBadge from '../../components/storefront/order-status-badge';
import { LoadingState } from '../../components/storefront/loading-state';

const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

const date = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: response,
    isLoading,
    error,
    errorMessage,
    load,
    reset,
  } = useApiLoading<PaginatedOrdersResponse>({
    initialData: { data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } },
    immediate: false,
  });

  const orders: CustomerOrder[] = response?.data ?? [];

  // Load orders when the user becomes authenticated.
  if (isAuthenticated && !isLoading && !response) {
    void load('/orders?limit=50');
  }

  if (authLoading || isLoading) {
    return (
      <LoadingState
        isLoading={true}
        error={null}
        data={null}
        loadingMessage="Loading your orders..."
        spinnerSize={16}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50/60 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Package size={30} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Sign in to see your orders
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your order history is linked to your account.
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

  return (
    <div className="bg-slate-50/60 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-[1000px]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          My account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Order history
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed.
        </p>

        <LoadingState
          isLoading={false}
          error={error ?? null}
          data={orders}
          emptyMessage="No orders yet"
          errorMessage={errorMessage ?? "Failed to load orders."}
          onRetry={() => {
            reset();
            void load('/orders?limit=50');
          }}
        >
          {orders.length > 0 && (
            <ul className="mt-8 space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-slate-950">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Placed on {date(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-base font-bold text-slate-950">
                        {money(order.totalAmount)}
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between text-sm text-slate-600"
                          >
                            <span className="truncate">
                              {item.product?.name ?? "Product"} × {item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span>Subtotal {money(order.subtotal)}</span>
                      {order.discountAmount > 0 && (
                        <span className="text-emerald-600">
                          Discount -{money(order.discountAmount)}
                        </span>
                      )}
                      <span>Shipping {money(order.shippingAmount)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </LoadingState>
      </div>
    </div>
  );
}
