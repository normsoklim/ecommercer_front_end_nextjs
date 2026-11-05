'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { useCart } from '@/app/lib/cart-context';
import type { CartItem } from '@/app/lib/api-types';
import { useCartDrawer } from '@/app/components/cart/CartDrawerContext';
import {
  createCheckout,
  createKhqrPayment,
  fetchKhqrPaymentStatus,
  verifyKhqrPayment,
  convertAmount,
  type CheckoutOrder,
  type KhqrPayment,
  type PaymentCurrency,
  type ShippingAddressInput,
} from '@/app/lib/checkout';
import {
  createCustomerAddress,
  fetchCustomerAddresses,
  type CustomerAddress, 
  type CreateAddressInput,
} from '@/app/lib/addresses';
import AddressForm from '@/app/components/storefront/checkout/address-form';
import OrderSummary from '@/app/components/storefront/checkout/order-summary';
import KhqrPaymentPanel from '@/app/components/storefront/checkout/khqr-payment-panel';
import { LoadingState } from '@/app/components/storefront/loading-state';

type Step = 'address' | 'payment' | 'done';

const STORAGE_KEY = 'storefront:checkout';
const TAX_RATE = 0.1;
const POLL_INTERVAL_MS = 6000;

interface StoredCheckout {
  order: CheckoutOrder;
  payment: KhqrPayment | null;
  currency: PaymentCurrency;
}

/** Builds an id that identifies one checkout attempt. */
function createKey(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}-${random}`;
}

/** Reads the error message of a failed API call. */
function toMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/** Reads the checkout that was stored in the session storage. */
function readStoredCheckout(): StoredCheckout | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredCheckout;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, subtotal, isLoading: cartLoading, refresh } = useCart();
  const { open: openCartDrawer } = useCartDrawer();

  const [step, setStep] = useState<Step>('address');
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<KhqrPayment | null>(null);
  const [currency, setCurrency] = useState<PaymentCurrency>('USD');
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [isLoadingSavedAddresses, setIsLoadingSavedAddresses] = useState(false);

  // The keys make the requests repeatable, a retry never creates a second order.
  const checkoutKey = useRef<string | null>(null);
  const paymentAttempt = useRef(0);
  const resumed = useRef(false);
  // The order of the running checkout, it is needed to store the payment.
  const orderRef = useRef<CheckoutOrder | null>(null);

  const persist = useCallback((data: StoredCheckout) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // The session storage is not available, the checkout still works.
    }
  }, []);

  const clearPersisted = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // The session storage is not available, nothing to clean up.
    }
  }, []);

  const completeOrder = useCallback(() => {
    clearPersisted();
    setStep('done');
    refresh();
  }, [clearPersisted, refresh]);

  const paymentId = payment?.id ?? null;

  // Creates the KHQR payment of an order, the amount is set by the API.
  const startPayment = useCallback(
    async (orderId: string, payCurrency: PaymentCurrency) => {
      if (!isAuthenticated) {
        return;
      }

      setIsCreatingPayment(true);
      setError(null);
      setMessage(null);

      try {
        paymentAttempt.current += 1;

        const created = await createKhqrPayment({
          orderId,
          currency: payCurrency,
          idempotencyKey: `payment-${orderId}-${payCurrency}-${paymentAttempt.current}`,
        });

        setPayment(created);
        setCurrency(payCurrency);

        if (orderRef.current) {
          persist({
            order: orderRef.current,
            payment: created,
            currency: payCurrency,
          });
        }
      } catch (err) {
        setError(
          toMessage(err, 'The payment could not be prepared. Please try again.'),
        );
      } finally {
        setIsCreatingPayment(false);
      }
    },
    [persist],
  );

  // An unfinished checkout is restored after a reload of the page.
  useEffect(() => {
    if (!isAuthenticated || resumed.current) {
      return;
    }

    resumed.current = true;

    const saved = readStoredCheckout();

    if (!saved?.order?.id) {
      clearPersisted();
      return;
    }

    const restored = saved;
    let cancelled = false;

    // The state is updated after the effect, so the first render of the page
    // stays untouched.
    Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      setOrder(restored.order);
      orderRef.current = restored.order;
      setCurrency(restored.currency ?? 'USD');
      setPayment(restored.payment ?? null);
      setStep('payment');
    });

    if (restored.payment?.id) {
      fetchKhqrPaymentStatus(restored.payment.id)
        .then((status) => {
          setPayment((current) =>
            current ? { ...current, ...status.payment } : status.payment,
          );

          if (status.payment.status === 'CAPTURED') {
            completeOrder();
          }
        })
        .catch(() => {
          // The status is only a hint, the customer can still verify manually.
        });
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, clearPersisted, completeOrder]);

  // While the QR code is waiting, the state of the payment is polled.
  useEffect(() => {
    if (step !== 'payment' || !paymentId) {
      return;
    }

    const timer = setInterval(() => {
      fetchKhqrPaymentStatus(paymentId)
        .then((status) => {
          setPayment((current) =>
            current ? { ...current, ...status.payment } : status.payment,
          );

          if (status.payment.status === 'CAPTURED') {
            completeOrder();
          }
        })
        .catch(() => {
          // A failed poll is not fatal, the next poll tries again.
        });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [step, paymentId, completeOrder]);

  const handlePlaceOrder = async (address: ShippingAddressInput) => {
    if (!isAuthenticated) {
      return;
    }

    setIsPlacingOrder(true);
    setError(null);
    setMessage(null);

    try {
      if (!checkoutKey.current) {
        checkoutKey.current = createKey('checkout');
      }

      const created = await createCheckout({
        shippingAddress: address,
        couponCode,
        idempotencyKey: checkoutKey.current,
      });

      setOrder(created);
      orderRef.current = created;
      setOrderedItems(items);
      setStep('payment');
      persist({
        order: created,
        payment: null,
        currency,
      });

      // The API empties the cart when the order is created.
      await refresh();
      await startPayment(created.id, currency);
    } catch (err) {
      setError(
        toMessage(err, 'The order could not be placed. Please try again.'),
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleVerify = async () => {
    if (!payment) {
      return;
    }

    setIsVerifying(true);
    setError(null);
    setMessage(null);

    try {
      const result = await verifyKhqrPayment(payment.id);

      setPayment((current) =>
        current ? { ...current, ...result.payment } : result.payment,
      );

      if (result.success || result.payment?.status === 'CAPTURED') {
        completeOrder();
        return;
      }

      setMessage(
        result.message ??
          'The payment is not confirmed yet. It can take a few seconds until the bank confirms it.',
      );
    } catch (err) {
      setError(toMessage(err, 'The payment could not be verified. Please try again.'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeCurrency = async (next: PaymentCurrency) => {
    if (!order || next === currency) {
      return;
    }

    setCurrency(next);

    await startPayment(order.id, next);
  };

  const handleRetryPayment = async () => {
    if (!order) {
      return;
    }

    await startPayment(order.id, currency);
  };

  // Loads the delivery addresses the customer saved from the Google map.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    fetchCustomerAddresses()
      .then((addresses) => {
        if (!cancelled) {
          setSavedAddresses(addresses);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedAddresses([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSavedAddresses(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Stores a newly picked delivery address for the signed in customer.
  const handleSaveAddress = useCallback(
    async (input: CreateAddressInput): Promise<CustomerAddress | null> => {
      if (!isAuthenticated) {
        return null;
      }

      const saved = await createCustomerAddress(input);

      setSavedAddresses((current) => [
        saved,
        ...current.filter((address) => address.id !== saved.id),
      ]);

      return saved;
    },
    [],
  );

  if (authLoading || (isAuthenticated && cartLoading)) {
    return (
      <LoadingState
        isLoading={true}
        error={null}
        data={null}
        loadingMessage="Loading the checkout..."
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
            Sign in to check out
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your cart and your orders are linked to your account.
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

  if (step === 'done' && order) {
    return (
      <div className="bg-slate-50/60 px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Thank you for your order
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The order <span className="font-semibold text-slate-900">#{order.orderNumber}</span>{' '}
            was paid and is being prepared.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-left text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: order.currency,
                }).format(order.subtotal / 100)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-slate-600">
              <span>Tax</span>
              <span className="font-semibold text-slate-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: order.currency,
                }).format(order.taxAmount / 100)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">Total paid</span>
              <span className="text-lg font-bold text-slate-950">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: order.currency,
                }).format(order.totalAmount / 100)}
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              <Package size={16} />
              View my orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderCurrency = order?.currency ?? 'USD';
  const displayCurrency = order ? currency : orderCurrency;

  const summaryItems = order
    ? orderedItems.map((item) => ({
        ...item,
        unitPrice: convertAmount(item.unitPrice, orderCurrency, currency),
      }))
    : items;
  const summarySubtotal = order
    ? convertAmount(order.subtotal, orderCurrency, currency)
    : subtotal;
  const summaryTax = order
    ? convertAmount(order.taxAmount, orderCurrency, currency)
    : Math.round(subtotal * TAX_RATE);
  const summaryShipping = order
    ? convertAmount(order.shippingAmount, orderCurrency, currency)
    : 0;
  const summaryTotal = order
    ? convertAmount(order.totalAmount, orderCurrency, currency)
    : subtotal + Math.round(subtotal * TAX_RATE);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <button
        type="button"
        onClick={openCartDrawer}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to cart
      </button>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {step === 'payment' ? 'Payment' : 'Checkout'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {step === 'payment'
              ? 'Scan the QR code to pay for your order.'
              : 'Tell us where the order should be delivered.'}
          </p>
        </div>

        <ol className="flex items-center gap-2 text-xs font-semibold">
          <li
            className={`rounded-full px-3 py-1.5 ${
              step === 'address'
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            1. Address
          </li>
          <li
            className={`rounded-full px-3 py-1.5 ${
              step === 'payment'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            2. Payment
          </li>
        </ol>
      </div>

      {error && step === 'address' && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {step === 'address' ? (
            items.length === 0 && !order ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <ShoppingBag size={40} className="text-slate-300" />
                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Your cart is empty
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add some products before you check out.
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                >
                  Start shopping
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <AddressForm
                 initialValues={{
                   firstName: user?.firstName ?? '',
                   lastName: user?.lastName ?? '',
                   phone: user?.phone ?? '',
                   addressLine1: '',
                   company: '',
                 }}
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                onSubmit={handlePlaceOrder}
                isSubmitting={isPlacingOrder}
                savedAddresses={savedAddresses}
                isLoadingSavedAddresses={isLoadingSavedAddresses}
                onSaveAddress={handleSaveAddress}
              />
            )
          ) : (
            <KhqrPaymentPanel
              payment={payment}
              currency={currency}
              isCreating={isCreatingPayment}
              isVerifying={isVerifying}
              error={error}
              message={message}
              onVerify={handleVerify}
              onRetry={handleRetryPayment}
              onChangeCurrency={handleChangeCurrency}
            />
          )}
        </div>

        <OrderSummary
          items={summaryItems}
          subtotal={summarySubtotal}
          taxAmount={summaryTax}
          shippingAmount={summaryShipping}
          totalAmount={summaryTotal}
          currency={displayCurrency}
          title={order ? `Order #${order.orderNumber}` : 'Order summary'}
        />
      </div>
    </div>
  );
}
