import { getProductBySlug } from "@/app/lib/products";
import type { Product } from "@/app/lib/api-types";
import Link from "next/link";
import { Suspense } from "react";
import ProductPurchasePanel from "@/app/components/storefront/product-purchase-panel";

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: Product | null = null;

  try {
    product = await getProductBySlug(slug);
  } catch (err) {
    console.error("Failed to load product", err);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
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
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600">Store</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-blue-600 font-medium">
                Products
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-blue-600 font-medium">
                Cart
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">Product Image</span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {categoryName}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-500 text-sm mb-4">SKU: {product.sku}</p>
              <p className="text-gray-600 mb-6">
                {product.shortDescription || product.description ||
                  "No description available."}
              </p>
              <div className="mb-6">
                <span className="text-2xl font-bold text-gray-900">
                  ${price.toFixed(2)}
                </span>
                {compareAtPrice && (
                  <span className="text-gray-400 text-sm ml-2 line-through">
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
