'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  type LucideIcon,
} from 'lucide-react';

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string;
  label: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
}

/**
 * A labelled text field with a leading icon and an optional hint or error
 * message. The error state is wired to the control through aria so screen
 * readers announce it as well.
 */
export function AuthField({
  id,
  label,
  icon: Icon,
  hint,
  error,
  type = 'text',
  ...props
}: AuthFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative mt-1.5">
        {Icon && (
          <Icon
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={id}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={[
            'block w-full rounded-xl border bg-slate-50/60 py-2.5 text-sm text-slate-900 shadow-sm transition',
            'placeholder:text-slate-400 focus:outline-none focus:ring-4',
            Icon ? 'pl-10' : 'pl-3.5',
            'pr-3.5',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10',
          ].join(' ')}
          {...props}
        />
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Password field with a show/hide toggle. */
export function AuthPasswordField({
  id,
  label,
  hint,
  error,
  ...props
}: Omit<AuthFieldProps, 'icon' | 'type'>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative mt-1.5">
        <Lock
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={[
            'block w-full rounded-xl border bg-slate-50/60 py-2.5 pl-10 pr-11 text-sm text-slate-900 shadow-sm transition',
            'placeholder:text-slate-400 focus:outline-none focus:ring-4',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10',
          ].join(' ')}
          {...props}
        />

        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface AuthShellProps {
  /** Headline of the branded left panel, e.g. "Welcome back". */
  eyebrow: string;
  /** Headline of the form panel. */
  title: string;
  /** Short paragraph under the form headline. */
  description: string;
  /** Paragraph in the branded left panel. */
  leftDescription: string;
  children: React.ReactNode;
  /** Bullet points rendered in the branded left panel. */
  highlights: { icon: LucideIcon; title: string; description: string }[];
}

export function AuthShell({
  eyebrow,
  title,
  description,
  leftDescription,
  children,
  highlights,
}: AuthShellProps) {
  return (
    <div className="bg-slate-50/60 px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <div className="mt-6 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
          <aside className="relative isolate overflow-hidden bg-slate-950 px-8 py-12 text-white sm:px-12">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-16 -z-10 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl"
            />

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-black tracking-tight"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-black text-white">
                S
              </span>
              ShopEase
            </Link>

            <h2 className="mt-10 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {eyebrow}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {leftDescription}
            </p>

            <ul className="mt-10 space-y-6">
              {highlights.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300 ring-1 ring-white/10">
                    <item.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <section className="px-6 py-12 sm:px-12">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-slate-500">{description}</p>

              <div className="mt-8">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Inline status banner used for errors and confirmations. */
export function AuthAlert({
  tone,
  children,
}: {
  tone: 'error' | 'success' | 'warning';
  children: React.ReactNode;
}) {
  const tones = {
    error: 'bg-red-50 text-red-700 ring-red-100',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-800 ring-amber-100',
  } as const;

  return (
    <div
      role="alert"
      className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

/** Primary submit button with a loading state. */
export function AuthSubmitButton({
  isLoading,
  loadingLabel,
  children,
}: {
  isLoading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-950"
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {isLoading ? loadingLabel : children}
    </button>
  );
}

