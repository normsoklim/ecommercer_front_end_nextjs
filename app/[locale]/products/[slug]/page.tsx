import { getProductBySlug } from "@/app/lib/products";
import type { Product } from "@/app/lib/api-types";
import Link from "next/link";
import { Suspense } from "react";
import ProductPurchasePanel from "@/app/components/storefront/product-purchase-panel";
import { ProductGallery } from "@/app/components/storefront/product/ProductGallery";
import { toGalleryImage } from "@/app/lib/image-urls";

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  let product: Product | null = null;

  try {
    product = await getProductBySlug(slug, locale);
  } catch (err) {
    console.error("Failed to load product", err);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
          <Link href="/" className="text-primary hover:text-primary">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const price = product.basePrice / 100;
  const compareAtPrice = product.compareAtPrice
    ? product.compareAtPrice / 100
    : null;
  const categoryName = product.category?.name ?? "";

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">Store</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-muted-foreground hover:text-primary font-medium">
                Home
              </Link>
              <Link href="/products" className="text-muted-foreground hover:text-primary font-medium">
                Products
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
              <ProductGallery
                images={(product.images ?? []).map((img) =>
                  toGalleryImage(img, product.name),
                )}
                alt={product.name}
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {categoryName}
              </p>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-sm mb-4">SKU: {product.sku}</p>
              <p className="text-muted-foreground mb-6">
                {product.shortDescription || product.description ||
                  "No description available."}
              </p>
              <div className="mb-6">
                <span className="text-2xl font-bold text-foreground">
                  ${price.toFixed(2)}
                </span>
                {compareAtPrice && (
                  <span className="text-muted-foreground text-sm ml-2 line-through">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <ProductPurchasePanel
                key={product.id}
                productId={product.id}
                variants={product.variants}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
