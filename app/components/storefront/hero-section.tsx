import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-3xl bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=90"
          alt="A curated fashion collection"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/5" />

        <div className="relative flex min-h-[480px] items-center px-6 py-16 sm:min-h-[540px] sm:px-12 lg:min-h-[600px] lg:px-20">
          <div className="max-w-xl text-white">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
              New season · New essentials
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
              Find your
              <br />
              everyday style.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/80 sm:text-base">
              Discover thoughtfully selected clothing, shoes and accessories
              made for the way you live.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-colors hover:bg-indigo-600 hover:text-white"
              >
                Shop collection
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/products?sort=popular"
                className="inline-flex items-center rounded-xl border border-white/50 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore best sellers
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {[
                "Carefully selected",
                "Secure checkout",
                "Easy order tracking",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                >
                  <Check size={13} className="text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
