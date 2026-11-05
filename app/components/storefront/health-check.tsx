'use client';

import { useEffect, useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { apiFetch } from '@/app/lib/api';

type HealthResponse = {
  status: string;
  database: string;
  message: string;
};

export function HealthCheck() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    apiFetch<HealthResponse>('/health/db', { cache: 'no-store' })
      .then((health) => {
        if (!cancelled) {
          setIsOnline(health.status === 'ok');
          setMessage(health.message);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsOnline(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isOnline === null) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-[1440] items-center justify-center gap-2 px-4 pb-10 text-xs text-slate-500 sm:px-6 lg:px-10">
      {isOnline ? (
        <CircleCheck size={14} className="text-emerald-600" />
      ) : (
        <CircleX size={14} className="text-amber-500" />
      )}
      <span>
        {isOnline
          ? `Storefront online · ${message ?? 'All systems operational'}`
          : 'Storefront running · backend API unreachable'}
      </span>
    </div>
  );
}
