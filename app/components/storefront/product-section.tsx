"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getProducts } from "@/app/lib/products";
import ProductCard from "@/app/components/storefront/product-card";
import type { Product } from "@/app/lib/api-types";

export default function ProductSection() {
  const t = useTranslations("ProductSection");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 12 }).then((response) => {
      setProducts(response.data);
      setLoading(false);
    });
  }, []);

  const visibleProducts = products.slice(0, 8);

  if (loading) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {t("handpickedForYou")}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("featuredProducts")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("discoverText")}
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          {t("viewAll")} <ArrowRight size={16} />
        </Link>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">
            {t("noProducts")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noProductsDescription")}
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
