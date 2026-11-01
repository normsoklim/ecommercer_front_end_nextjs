"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useCart } from "@/app/lib/cart-context";
import type { Category } from "@/app/lib/api-types";

const defaultLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
];

export default function SiteHeader({
  categories = [],
}: {
  categories?: Category[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();

  const categoryLinks = categories.map((category) => ({
    label: category.name,
    href: `/products?category=${category.slug}`,
  }));

  const links = [...defaultLinks, ...categoryLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="border-b border-slate-100 bg-slate-950 px-4 py-2 text-center text-xs tracking-wide text-white">
        Free shipping on orders over $100
      </div>
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="shrink-0">
          <img src="/assets/logo-ecommerce.png" alt="logo ecommerce" className="w-20 h-20 object-contain" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Toggle search"
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full p-2.5 text-slate-700 hover:bg-slate-100"
          >
            <Search size={20} />
          </button>

          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2.5 text-slate-700 hover:bg-slate-100 sm:block"
          >
            <UserRound size={20} />
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden rounded-full p-2.5 text-slate-700 hover:bg-slate-100 sm:block"
          >
            <Heart size={20} />
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative rounded-full p-2.5 text-slate-700 hover:bg-slate-100"
          >
            <ShoppingBag size={21} />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form
          action="/products"
          className="border-t border-slate-100 px-4 py-4 sm:px-8"
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
            <Search size={18} className="text-slate-400" />
            <input
              autoFocus
              name="search"
              placeholder="Search products..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              className="text-sm font-semibold text-indigo-600"
            >
              Search
            </button>
          </div>
        </form>
      )}

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white p-4 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
