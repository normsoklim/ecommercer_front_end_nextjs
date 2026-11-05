import { Suspense } from 'react';
import HeroSection from '@/app/components/storefront/hero/HeroSection';
import ValueStrip from '@/app/components/storefront/value-strip';
import CategorySection from '@/app/components/storefront/category-section';
import ProductSection from '@/app/components/storefront/product-section';
import PromoSection from '@/app/components/storefront/promo-section';
import NewsletterSection from '@/app/components/storefront/newsletter-section';
import { HealthCheck } from '@/app/components/storefront/health-check';

function ProductsSkeleton() {
  return (
    <section className="mx-auto max-w-[1440] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-8">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-9 w-64 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
            <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoriesSkeleton() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Explore the collection
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Shop by category
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="group relative overflow-hidden rounded-2xl bg-muted">
            <div className="aspect-[5/4] overflow-hidden">
              <div className="h-full w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-6">
              <div className="min-w-0 pr-3">
                <h3 className="text-xl font-bold animate-pulse rounded bg-white/20" />
                <p className="mt-1 line-clamp-2 text-sm text-white/80 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="hero min-h-[400px] flex items-center justify-center bg-muted">
      <div className="animate-pulse rounded-lg bg-background w-96 h-24" />
    </section>
  );
}

function ValueStripSkeleton() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-muted sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-background px-5 py-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground animate-pulse rounded w-32 h-5" />
              <p className="mt-0.5 text-xs text-muted-foreground animate-pulse rounded w-48 h-4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <div className="mt-6 sm:mt-8">
        <Suspense fallback={<ValueStripSkeleton />}>
          <ValueStrip />
        </Suspense>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategorySection />
      </Suspense>

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductSection />
      </Suspense>

      <PromoSection />

      <NewsletterSection />

      <HealthCheck />
    </>
  );
}
