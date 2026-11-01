import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="relative overflow-hidden rounded-3xl bg-indigo-950 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl text-white">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              A little something extra
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your next favorite
              <br className="hidden sm:block" /> starts here.
            </h2>
            <p className="mt-4 text-sm leading-6 text-indigo-100/80">
              Explore the latest collection and find pieces that fit your style.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-950 transition-colors hover:bg-indigo-100"
          >
            Explore collection <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
