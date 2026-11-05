import { getProductBySlug } from "@/app/lib/products";
import { notFound } from "next/navigation";
import { Star, Heart } from "lucide-react";
import { Suspense } from "react";
import ProductPurchasePanel from "@/app/components/storefront/product-purchase-panel";
import { ProductGallery } from "@/app/components/storefront/product/ProductGallery";
import { toGalleryImage } from "@/app/lib/image-urls";
import type { Product } from "@/app/lib/api-types";

function productRating(product: Product): number {
  const reviews = product.reviews ?? [];
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

function productReviewCount(product: Product): number {
  return product.reviews?.length ?? 0;
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div>
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-9 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-5 h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-12 w-full max-w-xs animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

async function ProductDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = product.basePrice / 100;
  const originalPrice = product.compareAtPrice
    ? product.compareAtPrice / 100
    : undefined;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
          <ProductGallery
            images={(product.images ?? []).map((img) =>
              toGalleryImage(img, product.name),
            )}
            alt={product.name}
          />
        </div>

        <div className="flex flex-col">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.category?.name ?? product.categoryId}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star size={16} fill="#F59E0B" strokeWidth={0} />
                <span className="font-semibold text-foreground">
                  {productRating(product).toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {productReviewCount(product)} reviews
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <ProductPurchasePanel
            key={product.id}
            productId={product.id}
            variants={product.variants}
          />

          <div className="mt-6 flex gap-3">
            <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted">
              <Heart size={20} />
            </button>
          </div>

          <div className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Stock:</span>
              <span className="text-green-600 dark:text-green-400">In stock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Shipping:</span>
              <span>Free shipping on orders over $100</span>
            </div>
          </div>

          {/* Customer reviews - rendered as plain React text (auto-escaped) to prevent Stored XSS */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Customer Reviews ({product.reviews.length})
              </h2>
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-foreground">
                        {review.user?.firstName ?? review.user?.email ?? 'Anonymous'}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {review.isVerifiedPurchase ? 'Verified purchase' : ''}
                      </span>
                      <div className="ml-auto flex items-center gap-1 text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`
                              text-xs
                              ${star <= review.rating ? 'text-yellow-400' : 'text-muted-foreground'}
                            `}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
