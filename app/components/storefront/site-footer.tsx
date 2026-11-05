"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Share2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * The year is read on the client only. The server renders a stable
 * placeholder so the prerender never depends on the clock, which Next.js
 * refuses to do.
 */
const FALLBACK_YEAR = 2026;

const subscribeToNothing = () => () => {};
const getClientYear = () => new Date().getFullYear();
const getServerYear = () => FALLBACK_YEAR;

const footerLinks = [
  { key: "shopAll", href: "/products" },
  { key: "clothing", href: "/products?category=Clothing" },
  { key: "shoes", href: "/products?category=Shoes" },
  { key: "accessories", href: "/products?category=Accessories" },
];

export default function SiteFooter() {
  const t = useTranslations("Footer");
  const year = useSyncExternalStore(
    subscribeToNothing,
    getClientYear,
    getServerYear,
  );

  return (
    <footer className="mt-12 border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-10 lg:py-16">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight text-foreground">
            ShopEase<span className="text-primary">.</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {t("everydayEssentials")}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-primary"
            >
              <Share2 size={18} />
            </a>
            <a
              href="https://www.facebook.com/"
              aria-label="Facebook"
              className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-primary"
            >
              <Share2 size={18} />
            </a>
            <a
              href="mailto:support@example.com"
              aria-label="Email support"
              className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-primary"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground">{t("shop")}</h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {t(link.key as "shopAll" | "clothing" | "shoes" | "accessories")}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground">{t("customerCare")}</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><Link href="/contact" className="hover:text-primary">{t("contactUs")}</Link></li>
            <li><Link href="/shipping" className="hover:text-primary">{t("shippingInfo")}</Link></li>
            <li><Link href="/returns" className="hover:text-primary">{t("returnsRefunds")}</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">{t("privacyPolicy")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        {t("copyright", { year })}
      </div>
    </footer>
  );
}
