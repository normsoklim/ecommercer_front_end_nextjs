"use client";

import {
  CreditCard,
  Headphones,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const benefits = [
  {
    icon: Truck,
    key: 'freeShipping',
  },
  {
    icon: RotateCcw,
    key: 'easyReturns',
  },
  {
    icon: CreditCard,
    key: 'secureCheckout',
  },
  {
    icon: Headphones,
    key: 'alwaysHere',
  },
];

export default function ValueStrip() {
  const t = useTranslations("ValueStrip");

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-muted sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.key}
            className="flex items-center gap-4 bg-background px-5 py-6 transition-colors hover:bg-muted"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <benefit.icon size={20} />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {t(benefit.key)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t(`${benefit.key}Desc` as const)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
