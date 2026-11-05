'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Mail,
  MailWarning,
  PackageCheck,
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import {
  AuthAlert,
  AuthField,
  AuthPasswordField,
  AuthSubmitButton,
} from '@/app/components/storefront/auth-shell';
import { Dialog } from '@/app/components/storefront/dialog';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired when the user wants to switch to the register dialog. */
  onRegister?: () => void;
  /** When true, shows a "email confirmed" success banner (used by /login?verified=1). */
  showVerifiedAlert?: boolean;
  /** Email to prefill in the form (used by /verify-email redirects). */
  defaultEmail?: string;
}

export function LoginDialog({
  open,
  onOpenChange,
  onRegister,
  showVerifiedAlert = false,
  defaultEmail = '',
}: LoginDialogProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: defaultEmail,
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-5">
        {showVerifiedAlert && (
          <AuthAlert tone="success">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} />
              Your email address is confirmed. You can sign in now.
            </span>
          </AuthAlert>
        )}

        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <AuthField
          id="login-email"
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
          id="login-password"
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

        <AuthSubmitButton isLoading={false} loadingLabel="Signing in...">
          Sign in
        </AuthSubmitButton>

        <p className="text-center text-sm text-slate-500">
          No account yet?{' '}
          {onRegister ? (
            <button
              type="button"
              onClick={onRegister}
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Create one
            </button>
          ) : (
            <Link
              href="/register"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Create one
            </Link>
          )}
        </p>

        <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <PackageCheck size={14} />
          New here? Your first order ships free over $50.
        </p>
      </form>
    </Dialog>
  );
}
