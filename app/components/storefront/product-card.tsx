"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useWishlist } from "@/app/lib/wishlist-context";
import { useAuth } from "@/app/lib/auth-context";
import QuickAddToCart from "@/app/components/storefront/quick-add-to-cart";
import type { Product } from "@/app/lib/api-types";

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("ProductCard");
  const { addItem, removeItem, isAuthenticated } = useWishlist();
  const { isLoading: authLoading } = useAuth();

  const [liked, setLiked] = useState(false);
  const [toggling, setToggling] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ??
    "/placeholder-product.svg";

  const price = product.basePrice / 100;
  const originalPrice = product.compareAtPrice
    ? product.compareAtPrice / 100
    : undefined;

  const categoryName = product.category?.name ?? "";

  const discount =
    originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  const handleToggleWishlist = async () => {
    setToggling(true);
    try {
      if (liked) {
        await removeItem(product.id);
      } else {
        await addItem({ productId: product.id });
      }
      setLiked(!liked);
    } catch {
      // Error is already stored in the wishlist context.
    } finally {
      setToggling(false);
    }
  };

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-bold text-background shadow-sm">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          aria-label={liked ? t("removeFromWishlist") : t("addToWishlist")}
          aria-pressed={liked}
          onClick={handleToggleWishlist}
          disabled={toggling || (!isAuthenticated && !authLoading)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-colors hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {toggling ? (
            <Heart size={18} />
          ) : (
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-rose-500" : ""}
            />
          )}
        </button>

        <Link
          href={`/product/${product.slug}`}
          className="absolute bottom-3 left-3 right-3 translate-y-2 rounded-xl bg-background/95 py-3 text-center text-sm font-semibold text-foreground opacity-0 shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:text-white group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          {t("viewProduct")}
        </Link>
      </div>

      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {categoryName}
        </p>

        <Link
          href={`/product/${product.slug}`}
          className="mt-1 block text-sm font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              ${price.toFixed(2)}
            </span>

            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star size={13} fill="#F59E0B" strokeWidth={0} />
            {product.reviews?.length
              ? (
                product.reviews.reduce((acc, r) => acc + r.rating, 0) /
                  product.reviews.length
              ).toFixed(1)
              : "0.0"
            }
            <span className="text-muted-foreground">({product.reviews?.length ?? 0})</span>
          </span>
        </div>

        <div className="mt-4">
          <QuickAddToCart
            productId={product.id}
            productName={product.name}
            variants={product.variants}
          />
        </div>
      </div>
    </article>
  );
}
