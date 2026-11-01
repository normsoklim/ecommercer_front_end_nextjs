import { Suspense } from "react";
import ProductCard from "@/app/components/storefront/product-card";
import { getCategories, getProducts } from "@/app/lib/products";
import type { Product } from "@/app/lib/api-types";

function ProductsSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100 sm:h-10" />
        <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-slate-100" />
            <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Validates and sanitizes a search query for reflected XSS defense.
 * Trims whitespace and limits length. React's safe text rendering provides
 * the output protection; this is defense-in-depth for input length.
 */
function validateSearchQuery(query: string): string {
  return query.trim().slice(0, 100);
}

async function ProductsResults({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const safeSearch = validateSearchQuery(search ?? '');

  const categories = await getCategories();
  const activeCategory = categories.find((item) => {
    if (!category) return false;
    const value = category.toLowerCase();
    return (
      item.slug.toLowerCase() === value ||
      String(item.id).toLowerCase() === value ||
      item.name.toLowerCase() === value
    );
  });

  const response = await getProducts({
    categoryId: activeCategory?.id,
    search: safeSearch,
  });

  const products: Product[] = response.data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {response.meta.total} products found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-slate-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
