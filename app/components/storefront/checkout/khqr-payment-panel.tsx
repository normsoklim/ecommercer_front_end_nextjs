'use client';

import { useEffect, useState } from 'react';
import { Loader2, QrCode, RefreshCw, Smartphone } from 'lucide-react';
import type {
  KhqrPayment,
  PaymentCurrency,
} from '@/app/lib/checkout';

type KhqrPaymentPanelProps = {
  payment: KhqrPayment | null;
  currency: PaymentCurrency;
  isCreating: boolean;
  isVerifying: boolean;
  error: string | null;
  message: string | null;
  onVerify: () => void;
  onRetry: () => void;
  onChangeCurrency: (currency: PaymentCurrency) => void;
};

const CURRENCIES: PaymentCurrency[] = ['USD', 'KHR'];

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount);

/**
 * Counts the seconds that are left until the QR code expires. The clock is
 * kept in the state, the remaining time is calculated while rendering.
 */
function useCountdown(expiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  if (!expiresAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - now) / 1000),
  );
}

export default function KhqrPaymentPanel({
  payment,
  currency,
  isCreating,
  isVerifying,
  error,
  message,
  onVerify,
  onRetry,
  onChangeCurrency,
}: KhqrPaymentPanelProps) {
  const secondsLeft = useCountdown(payment?.expiresAt);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = Boolean(payment?.expiresAt) && secondsLeft === 0;
  const isFailed = payment?.status === 'FAILED';
  const canVerify =
    Boolean(payment) && !isExpired && !isFailed && payment?.status === 'PENDING';

  const amountInMajorUnits =
    payment?.amountInMajorUnits ??
    (payment ? payment.amount / (payment.currency === 'USD' ? 100 : 1) : 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <QrCode size={18} className="text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-950">Pay with KHQR</h2>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Scan the QR code with any Cambodian banking app (or Bakong), then confirm
        the payment below.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CURRENCIES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChangeCurrency(option)}
            disabled={isCreating || isVerifying}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              currency === option
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {option === 'USD' ? 'USD ($)' : 'KHR (៛)'}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center">
        {isCreating && (
          <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <Loader2 size={28} className="animate-spin text-indigo-600" />
          </div>
        )}

        {!isCreating && payment?.qrCodeImage && (
          // The QR code is a data URL that is rendered by the API.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payment.qrCodeImage}
            alt="KHQR payment QR code"
            className="h-64 w-64 rounded-2xl border border-slate-200 bg-white p-2"
          />
        )}

        {!isCreating && payment && !payment.qrCodeImage && (
          <div className="flex h-64 w-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <QrCode size={28} className="text-slate-300" />
            <p className="text-xs text-slate-500">
              The QR code is already active. Open the payment again in your
              banking app or generate a new QR code.
            </p>
          </div>
        )}

        {payment && (
          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Amount to pay
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {money(amountInMajorUnits, payment.currency || currency)}
            </p>
            {payment.originalCurrency && payment.originalCurrency !== payment.currency && (
              <p className="mt-1 text-xs text-slate-500">
                Order total {money(payment.originalAmount ?? 0, payment.originalCurrency)}
              </p>
            )}
          </div>
        )}

        {payment?.expiresAt && (
          <p
            className={`mt-3 text-sm font-semibold ${
              isExpired ? 'text-rose-600' : 'text-slate-600'
            }`}
          >
            {isExpired
              ? 'This QR code has expired.'
              : `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`}
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {!error && message && (
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          {message}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onVerify}
          disabled={!canVerify || isVerifying || isCreating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Smartphone size={16} />
          )}
          {isVerifying ? 'Checking the payment...' : 'I have paid'}
        </button>

        {(isExpired || isFailed) && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Generate a new QR code
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        The order is confirmed as soon as the payment is captured by the bank.
      </p>
    </div>
  );
}
