"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export const STOREFRONT_NAV_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Danh mục nấm", href: "/products" },
  { label: "Tri thức nấm", href: "/blog" },
  { label: "Ưu đãi", href: "/promotions" },
] as const;

interface MobileNavigationProps {
  cartCount: number;
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  pathname: string;
}

function isRouteActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNavigation({
  cartCount,
  isOpen,
  onClose,
  onSearch,
  pathname,
}: MobileNavigationProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Điều hướng CyberMushroom">
      <nav aria-label="Điều hướng di động" className="flex flex-col gap-2">
        {STOREFRONT_NAV_LINKS.map((link) => {
          const active = isRouteActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-12 items-center border px-4 font-heading text-xs font-black uppercase tracking-[0.14em] transition-colors focus-visible:bio-focus",
                active
                  ? "border-primary-neon/30 bg-primary-neon/[0.08] text-primary-neon before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:bg-primary-neon"
                  : "border-white/[0.07] bg-white/[0.025] text-text-muted hover:border-white/15 hover:text-text-pure",
              )}
            >
              {link.label}
              {active && <span className="ml-auto font-mono text-[9px]">Đang xem</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-white/[0.07] pt-4">
        <button
          type="button"
          onClick={onSearch}
          className="flex min-h-12 items-center gap-3 border border-white/[0.07] px-4 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Tìm kiếm nhanh
          <span className="ml-auto text-[9px] text-text-dark">Ctrl K</span>
        </button>
        <Link
          href="/cart"
          onClick={onClose}
          className="flex min-h-12 items-center gap-3 border border-white/[0.07] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Giỏ hàng
          <span className="ml-auto flex min-w-6 items-center justify-center bg-primary-neon px-1.5 py-0.5 text-background-deep">
            {cartCount}
          </span>
        </Link>
        <Link
          href="/account"
          onClick={onClose}
          className="flex min-h-12 items-center gap-3 border border-white/[0.07] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus"
        >
          <User className="h-4 w-4" aria-hidden="true" />
          Tài khoản
        </Link>
      </div>
    </Drawer>
  );
}
