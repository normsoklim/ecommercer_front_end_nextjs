'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Mail,
  MailWarning,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import {
  AuthAlert,
  AuthField,
  AuthPasswordField,
  AuthShell,
  AuthSubmitButton,
} from '../components/storefront/auth-shell';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const wasVerified = searchParams.get('verified') === '1';
  const needsVerification = error
    .toLowerCase()
    .includes('verify your email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      leftDescription="Sign in to follow your orders, save your favourites and check out faster with everything waiting for you."
      title="Sign in to your account"
      description="Enter your details to continue shopping with ShopEase."
      highlights={[
        {
          icon: Truck,
          title: 'Track every order',
          description: 'Follow your deliveries from checkout to your door.',
        },
        {
          icon: Sparkles,
          title: 'Keep your wishlist',
          description: 'Save now and come back to your favourites later.',
        },
        {
          icon: ShieldCheck,
          title: 'Secure checkout',
          description: 'Your details are encrypted on every purchase.',
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {wasVerified && (
          <AuthAlert tone="success">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} />
              Your email address is confirmed. You can sign in now.
            </span>
          </AuthAlert>
        )}

        {error && !needsVerification && <AuthAlert tone="error">{error}</AuthAlert>}

        {needsVerification && (
          <AuthAlert tone="warning">
            <span className="inline-flex items-start gap-2">
              <MailWarning size={16} className="mt-0.5 shrink-0" />
              <span>
                {error} Enter your email address on the{' '}
                <Link
                  href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                  className="font-semibold underline underline-offset-2"
                >
                  verification screen
                </Link>{' '}
                to confirm it.
              </span>
            </span>
          </AuthAlert>
        )}

        <AuthField
          id="email"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          required
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setError('');
          }}
        />

        <AuthPasswordField
          id="password"
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            setError('');
          }}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => {
              setFormData({ ...formData, rememberMe: e.target.checked });
              setError('');
            }}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Remember me
        </label>

        <AuthSubmitButton isLoading={isLoading} loadingLabel="Signing in...">
          Sign in
        </AuthSubmitButton>

        <p className="text-center text-sm text-slate-500">
          No account yet?{' '}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Create one
          </Link>
        </p>

        <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <PackageCheck size={14} />
          New here? Your first order ships free over $50.
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50/60 px-4 py-16 text-center text-sm text-slate-500 sm:px-6 lg:px-10">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
