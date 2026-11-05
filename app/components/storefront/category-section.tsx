"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Category } from "@/app/lib/api-types";
import { getCategories } from "@/app/lib/products";

export default function CategorySection() {
  const t = useTranslations("CategorySection");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return null;
  }

  const shorten = (text: string, max = 64) =>
    text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;

  const items = [
    ...categories.slice(0, 3).map((category, index) => ({
      name: category.name,
      description: shorten(
        category.description ?? t("exploreCollectionDesc"),
      ),
      href: `/products?category=${category.slug}`,
      image:
        category.imageUrl
    }))
      .map((fallback) => ({
        name: fallback.name,
        description: fallback.description,
        href: fallback.href,
        image: fallback.image,
      })),
  ].slice(0, 3);

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {t("exploreCollection")}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("shopByCategory")}
          </h2>
        </div>

        <Link
          href="/products"
          className="hidden items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary sm:flex"
        >
          {t("viewAll")} <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {items.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative overflow-hidden rounded-2xl bg-muted"
          >
            <div className="aspect-[5/4] overflow-hidden">
              <img
                src={category.image ?? '/placeholder-product.svg'}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-6">
              <div className="min-w-0 pr-3">
                <h3 className="text-xl font-bold">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/80">
                  {category.description}
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight size={20} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
