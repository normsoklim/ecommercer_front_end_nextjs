import type { Metadata } from "next";
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {routing} from '@/src/i18n/routing';
import enMessages from '@/messages/en.json';
import kmMessages from '@/messages/km.json';
import "@/app/globals.css";
import SiteHeader from "@/app/components/storefront/site-header";
import SiteFooter from "@/app/components/storefront/site-footer";
import { ThemeProvider } from "@/app/lib/theme-context";
import { AuthProvider } from "@/app/lib/auth-context";
import { CartProvider } from "@/app/lib/cart-context";
import { CartInitializer } from "@/app/components/cart/CartInitializer";
import { CartDrawerWrapper } from "@/app/components/cart/CartDrawerWrapper";
import { WishlistProvider } from "@/app/lib/wishlist-context";
import LanguageSwitcher from "@/src/components/language-switcher";

const messagesByLocale = { en: enMessages, km: kmMessages };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = messagesByLocale[locale as keyof typeof messagesByLocale];

  return (
    <html lang={locale}>
      <body className={`min-h-screen antialiased ${locale === 'km' ? 'font-khmer' : 'font-english'}`}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <CartInitializer />
              <WishlistProvider>
                <NextIntlClientProvider messages={messages}>
                  <CartDrawerWrapper categories={[]}>
                    <main>
                      <LanguageSwitcher />
                      {children}
                      <SiteFooter />
                    </main>
                  </CartDrawerWrapper>
                </NextIntlClientProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
