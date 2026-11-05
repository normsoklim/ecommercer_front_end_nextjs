"use client";

import {Link} from "@/src/i18n/routing";
import { useState } from "react";
import {
  Search,
  Heart,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { CartBadge } from "@/app/components/cart/CartBadge";
import ThemeToggle from "@/app/components/storefront/theme-toggle";
import { useAuth } from "@/app/lib/auth-context";
import type { Category } from "@/app/lib/api-types";
import { LoginDialog } from "@/app/components/storefront/login-dialog";
import { RegisterDialog } from "@/app/components/storefront/register-dialog";

export default function SiteHeader({
  categories = [],
  onCartClick,
}: {
  categories?: Category[];
  onCartClick?: () => void;
}) {
  const t = useTranslations("Navigation");
  const { isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const defaultLinks = [
    { label: t("home"), href: "/" },
    { label: t("products"), href: "/products" },
  ];

  const categoryLinks = categories.map((category) => ({
    label: category.name,
    href: `/products?category=${category.slug}`,
  }));

  const links = [...defaultLinks, ...categoryLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="border-b border-border bg-foreground px-4 py-2 text-center text-xs tracking-wide text-background">
        {t("Home.freeShipping")}
      </div>
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? t("Common.cancel") : t("Common.save")}
          className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="shrink-0">
          <p className="text-lg font-bold tracking-tight">Ecommerce Store</p>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Toggle search"
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-full p-2.5 text-foreground hover:bg-muted"
          >
            <Search size={20} />
          </button>

          {isLoading ? (
            <span className="hidden sm:block rounded-full p-2.5 text-foreground hover:bg-muted" />
          ) : isAuthenticated ? (
            <Link
              href="/account"
              aria-label={t("account")}
              className="hidden rounded-full p-2.5 text-foreground hover:bg-muted sm:block"
            >
              <UserRound size={20} />
            </Link>
          ) : (
            <>
              <button
                onClick={() => setLoginDialogOpen(true)}
                aria-label={t("login")}
                className="hidden rounded-full p-2.5 text-foreground hover:bg-muted sm:block"
                title={t("login")}
              >
                {t("login")}
              </button>
              <button
                onClick={() => setRegisterDialogOpen(true)}
                aria-label={t("register")}
                className="hidden rounded-full p-2.5 text-foreground hover:bg-muted sm:block"
                title={t("register")}
              >
                {t("register")}
              </button>
            </>
          )}

          <Link
            href="/wishlist"
            aria-label={t("wishlist")}
            className="hidden rounded-full p-2.5 text-foreground hover:bg-muted sm:block"
          >
            <Heart size={20} />
          </Link>

          <CartBadge onClick={onCartClick} />
          <ThemeToggle />
        </div>
      </div>

      {searchOpen && (
        <form
          action="/products"
          className="border-t border-border px-4 py-4 sm:px-8"
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-border px-4 py-3 focus-within:border-primary">
            <Search size={18} className="text-muted-foreground" />
            <input
              autoFocus
              name="search"
              placeholder={t("Common.searchPlaceholder")}
              aria-label={t("Common.search")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              className="text-sm font-semibold text-primary"
            >
              {t("Common.search")}
            </button>
          </div>
        </form>
      )}

      {menuOpen && (
        <nav className="border-t border-border bg-background p-4 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setLoginDialogOpen(true);
                }}
                className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-muted"
              >
                {t("login")}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setRegisterDialogOpen(true);
                }}
                className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-muted"
              >
                {t("register")}
              </button>
            </>
          )}
        </nav>
      )}

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onRegister={() => {
          setLoginDialogOpen(false);
          setRegisterDialogOpen(true);
        }}
      />
      <RegisterDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onLogin={() => {
          setRegisterDialogOpen(false);
          setLoginDialogOpen(true);
        }}
      />
    </header>
  );
}
