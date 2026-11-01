"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useWishlist } from "@/app/lib/wishlist-context";
import { useAuth } from "@/app/lib/auth-context";
import QuickAddToCart from "@/app/components/storefront/quick-add-to-cart";
import type { Product } from "@/app/lib/api-types";

export default function ProductCard({ product }: { product: Product }) {
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
      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
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
          <span className="absolute left-3 top-3 rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          onClick={handleToggleWishlist}
          disabled={toggling || (!isAuthenticated && !authLoading)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-colors hover:text-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
          className="absolute bottom-3 left-3 right-3 translate-y-2 rounded-xl bg-white/95 py-3 text-center text-sm font-semibold text-slate-900 opacity-0 shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:text-white group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          View product
        </Link>
      </div>

      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {categoryName}
        </p>

        <Link
          href={`/product/${product.slug}`}
          className="mt-1 block text-sm font-semibold text-slate-900 hover:text-indigo-600"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-950">
              ${price.toFixed(2)}
            </span>

            {originalPrice && originalPrice > price && (
              <span className="text-sm text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <span className="flex items-center gap-1 text-xs text-slate-600">
            <Star size={13} fill="#F59E0B" strokeWidth={0} />
            {product.reviews?.length
              ? (
                product.reviews.reduce((acc, r) => acc + r.rating, 0) /
                  product.reviews.length
              ).toFixed(1)
              : "0.0"
            }
            <span className="text-slate-400">({product.reviews?.length ?? 0})</span>
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
