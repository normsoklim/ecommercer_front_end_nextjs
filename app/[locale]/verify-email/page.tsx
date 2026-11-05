'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';


const CODE_LENGTH = 6;
/** Mirrors the API side cooldown (OTP_RESEND_COOLDOWN_SECONDS). */
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerificationCode } = useAuth();

  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Countdown of the resend button.
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (code.length !== CODE_LENGTH) {
      setError(`Please enter the ${CODE_LENGTH} digit code from your inbox.`);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await verifyEmail(email, code);
      router.push('/login?verified=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setNotice('');

    try {
      const response = await resendVerificationCode(email);

      setNotice(
        response.message || 'A new verification code has been sent to your inbox.',
      );
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to send a new code.',
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            No email address to verify
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The verification screen needs the email address of your new account.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Mail size={28} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We sent a {CODE_LENGTH} digit verification code to
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-slate-700"
            >
              Verification code
            </label>
            <input
              ref={inputRef}
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={CODE_LENGTH}
              required
              value={code}
              onChange={handleChange}
              placeholder="000000"
              aria-label={`${CODE_LENGTH} digit verification code`}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-3 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              The code expires shortly after it was sent.
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.length !== CODE_LENGTH}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying && <Loader2 size={16} className="animate-spin" />}
            {isVerifying ? 'Verifying...' : 'Verify email'}
          </button>

          <div className="flex flex-col items-center gap-2 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="inline-flex items-center gap-2 font-medium text-indigo-600 transition-colors hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:text-slate-400"
            >
              {isResending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {cooldown > 0
                ? `Resend code in ${cooldown}s`
                : 'Resend verification code'}
            </button>

            <Link
              href="/login"
              className="text-slate-500 transition-colors hover:text-slate-700"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-8 text-center sm:px-6 lg:px-10 lg:py-12">
          Loading...
        </div>
      }
    >
      <VerifyEmailCard />
    </Suspense>
  );
}
