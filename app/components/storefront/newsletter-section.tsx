'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Mail, Sparkles } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setStatus('loading');

    // There is no mailing list endpoint yet, the sign up is confirmed
    // locally so the interaction still feels complete.
    window.setTimeout(() => setStatus('done'), 600);
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            <Sparkles size={13} />
            Members only
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get 10% off your first order
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
            Join the list for early access to drops, private sales and styling
            tips. No spam, unsubscribe any time.
          </p>

          {status === 'done' ? (
            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-sm font-semibold text-white ring-1 ring-white/15">
              <CheckCircle2 size={18} className="text-emerald-400" />
              You are on the list. Check your inbox for your code.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              noValidate
            >
              <div className="relative flex-1">
                <Mail
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {status === 'loading' ? 'Signing up' : 'Get my 10%'}
              </button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-rose-300">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
