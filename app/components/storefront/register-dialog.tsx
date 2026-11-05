'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgePercent,
  Gift,
  Mail,
  User,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import {
  AuthAlert,
  AuthField,
  AuthPasswordField,
  AuthSubmitButton,
} from '@/app/components/storefront/auth-shell';
import { Dialog } from '@/app/components/storefront/dialog';

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired when the user wants to switch to the login dialog. */
  onLogin?: () => void;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_RULES = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: '1 uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { label: '1 number', test: (value: string) => /[0-9]/.test(value) },
];

export function RegisterDialog({
  open,
  onOpenChange,
  onLogin,
}: RegisterDialogProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');

  const passwordChecks = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        passed: rule.test(formData.password),
      })),
    [formData.password],
  );

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    try {
      const result = await register(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
      );

      // A new account is not usable until the address is confirmed, the API
      // sends a one-time code for that. Send the customer to the code screen
      // instead of the account page.
      if (result.requiresVerification) {
        onOpenChange(false);
        window.location.href = `/verify-email?email=${encodeURIComponent(result.email)}`;
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const update = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Create your account">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="register-firstName"
            label="First name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Sokha"
            icon={User}
            required
            value={formData.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            error={fieldErrors.firstName}
          />

          <AuthField
            id="register-lastName"
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Chan"
            icon={User}
            required
            value={formData.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            error={fieldErrors.lastName}
          />
        </div>

        <AuthField
          id="register-email"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          required
          value={formData.email}
          onChange={(e) => update('email', e.target.value)}
          error={fieldErrors.email}
          hint="We will send a verification code to this address."
        />

        <div>
          <AuthPasswordField
            id="register-password"
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => update('password', e.target.value)}
            error={fieldErrors.password}
          />

          <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
            {passwordChecks.map((check) => (
              <li
                key={check.label}
                className={`flex items-center gap-1.5 text-xs ${
                  check.passed ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${
                    check.passed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {check.passed ? '✓' : '•'}
                </span>
                {check.label}
              </li>
            ))}
          </ul>
        </div>

        <AuthPasswordField
          id="register-confirmPassword"
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your password"
          required
          value={formData.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        <AuthSubmitButton isLoading={false} loadingLabel="Creating account...">
          Create account
        </AuthSubmitButton>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          {onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Sign in
            </button>
          ) : (
            <Link
              href="/login"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Sign in
            </Link>
          )}
        </p>

        <p className="text-center text-xs leading-relaxed text-slate-400">
          By creating an account you agree to our terms of service and privacy
          policy.
        </p>
      </form>
    </Dialog>
  );
}
