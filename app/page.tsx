import { Suspense } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { apiFetch } from '@/app/lib/api';
import HeroSection from '@/app/components/storefront/hero-section';
import ValueStrip from '@/app/components/storefront/value-strip';
import CategorySection from '@/app/components/storefront/category-section';
import ProductSection from '@/app/components/storefront/product-section';
import PromoSection from '@/app/components/storefront/promo-section';
import NewsletterSection from '@/app/components/storefront/newsletter-section';

type HealthResponse = {
  status: string;
  database: string;
  message: string;
};

async function HealthCheck() {
  let health: HealthResponse | null = null;

  try {
    health = await apiFetch<HealthResponse>('/health/db', {
      cache: 'no-store',
    });
  } catch {
    health = null;
  }

  const isOnline = health?.status === 'ok';

  return (
    <div className="mx-auto flex max-w-[1440] items-center justify-center gap-2 px-4 pb-10 text-xs text-slate-500 sm:px-6 lg:px-10">
      {isOnline ? (
        <CircleCheck size={14} className="text-emerald-600" />
      ) : (
        <CircleX size={14} className="text-amber-500" />
      )}
      <span>
        {isOnline
          ? `Storefront online · ${health?.message ?? 'All systems operational'}`
          : 'Storefront running · backend API unreachable'}
      </span>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <section className="mx-auto max-w-[1440] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-8">
        <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-9 w-64 animate-pulse rounded-lg bg-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-slate-100" />
            <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <>
      <HeroSection />

      <div className="mt-6 sm:mt-8">
        <ValueStrip />
      </div>

      <CategorySection />

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductSection />
      </Suspense>

      <PromoSection />

      <NewsletterSection />

      <Suspense fallback={null}>
        <HealthCheck />
      </Suspense>
    </>
  );
}
