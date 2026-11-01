import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/app/components/storefront/site-header";
import SiteFooter from "@/app/components/storefront/site-footer";
import { AuthProvider } from "./lib/auth-context";
import { CartProvider } from "./lib/cart-context";
import { WishlistProvider } from "./lib/wishlist-context";
import { getCategories } from "./lib/products";

export const metadata: Metadata = {
  title: {
    default: "ShopEase | Everyday Style",
    template: "%s | ShopEase",
  },
  description:
    "Discover clothing, shoes and accessories at ShopEase. Find your everyday style.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SiteHeader categories={categories} />
              <main>{children}</main>
              <SiteFooter />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
