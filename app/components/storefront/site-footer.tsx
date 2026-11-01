"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Share2, Mail } from "lucide-react";

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
  { label: "Shop all", href: "/products" },
  { label: "Clothing", href: "/products?category=Clothing" },
  { label: "Shoes", href: "/products?category=Shoes" },
  { label: "Accessories", href: "/products?category=Accessories" },
];

export default function SiteFooter() {
  const year = useSyncExternalStore(
    subscribeToNothing,
    getClientYear,
    getServerYear,
  );

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-10 lg:py-16">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight text-slate-950">
            ShopEase<span className="text-indigo-600">.</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            Everyday essentials, carefully selected for your style and lifestyle.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              className="rounded-full border border-slate-200 p-2.5 text-slate-600 hover:text-indigo-600"
            >
              <Share2 size={18} />
            </a>
            <a
              href="https://www.facebook.com/"
              aria-label="Facebook"
              className="rounded-full border border-slate-200 p-2.5 text-slate-600 hover:text-indigo-600"
            >
              <Share2 size={18} />
            </a>
            <a
              href="mailto:support@example.com"
              aria-label="Email support"
              className="rounded-full border border-slate-200 p-2.5 text-slate-600 hover:text-indigo-600"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">Shop</h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-indigo-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">Customer care</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><Link href="/contact" className="hover:text-indigo-600">Contact us</Link></li>
            <li><Link href="/shipping" className="hover:text-indigo-600">Shipping information</Link></li>
            <li><Link href="/returns" className="hover:text-indigo-600">Returns and refunds</Link></li>
            <li><Link href="/privacy" className="hover:text-indigo-600">Privacy policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-500">
        © {year} ShopEase. All rights reserved.
      </div>
    </footer>
  );
}
