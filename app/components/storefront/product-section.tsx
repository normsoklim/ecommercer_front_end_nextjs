import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/app/lib/products";
import ProductCard from "@/app/components/storefront/product-card";
import type { Product } from "@/app/lib/api-types";

export default async function ProductSection() {
  const response = await getProducts({ limit: 12 });
  const products: Product[] = response.data;
  const visibleProducts = products.slice(0, 8);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Handpicked for you
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Featured products
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Discover the pieces customers love.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:bg-slate-950 hover:text-white"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-900">
            No products yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Products added from the admin panel will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {visibleProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
