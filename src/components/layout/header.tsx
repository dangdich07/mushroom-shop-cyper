"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { AnnouncementBar } from "./announcement-bar";
import {
  MobileNavigation,
  STOREFRONT_NAV_LINKS,
} from "./mobile-navigation";

interface HeaderCartItem {
  quantity: number;
}

interface ExpectedHeaderCartState {
  items: HeaderCartItem[];
}

export const Header = () => {
  const pathname = usePathname();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const cartStore = useCartStore() as unknown as ExpectedHeaderCartState;
  const totalItemsCount =
    cartStore.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const closeMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-cyber-search"));
  }, []);

  const openSearchFromMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(false);
    // Wait for Drawer cleanup to restore its scroll lock and focus before
    // opening the single global CommandMenu instance.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(openSearch);
    });
  }, [openSearch]);

  const isRouteActive = (href: string) =>
    href === "/"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary-neon/[0.12] bg-background-deep/90 shadow-surface-1 backdrop-blur-xl">
      <AnnouncementBar />
      <Container wide className="flex h-[4.5rem] items-center justify-between gap-1 sm:gap-3 xl:gap-6">
        <BrandMark />

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-5 font-heading text-[13px] font-semibold tracking-[-0.01em] lg:flex xl:gap-8 xl:text-sm"
        >
          {STOREFRONT_NAV_LINKS.map((link) => {
            const isActive = isRouteActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center transition-colors focus-visible:bio-focus after:absolute after:bottom-0 after:left-0 after:h-0.5 after:transition-[width,background-color] after:duration-[var(--motion-duration-normal)]",
                  isActive
                    ? "font-black text-primary-neon after:w-full after:bg-primary-neon"
                    : "text-text-dark after:w-0 after:bg-transparent hover:text-text-pure hover:after:w-full hover:after:bg-white/30",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-0 font-mono text-xs text-text-dark sm:gap-2">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Mở tìm kiếm nhanh"
            className="hidden min-h-11 min-w-11 items-center justify-center border border-transparent transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-text-pure focus-visible:bio-focus sm:flex xl:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={openSearch}
            className="hidden min-h-11 w-[min(23vw,22rem)] items-center gap-3 rounded-control border border-primary-neon/20 bg-background-dark/75 px-4 text-left text-xs tracking-normal text-text-dark shadow-[inset_0_0_18px_rgba(0,245,255,0.025)] transition-colors hover:border-primary-neon/45 hover:text-text-pure focus-visible:bio-focus xl:flex"
          >
            <Search className="h-[18px] w-[18px] shrink-0 text-primary-neon" aria-hidden="true" />
            <span className="truncate">Tìm kiếm sản phẩm...</span>
            <span aria-hidden="true" className="ml-auto border border-white/10 px-1.5 py-0.5 text-[8px]">
              Ctrl K
            </span>
          </button>
          <ThemeToggle compact className="max-sm:min-h-10 max-sm:min-w-10" />

          <Link
            href="/cart"
            aria-label={`Giỏ hàng, ${totalItemsCount} sản phẩm`}
            className="relative flex min-h-10 min-w-10 items-center justify-center border border-transparent transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-text-pure focus-visible:bio-focus sm:min-h-11 sm:min-w-11"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalItemsCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-primary-neon px-1 font-mono text-[9px] font-black text-background-deep shadow-[0_0_8px_#00F5FF]">
                {totalItemsCount}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            aria-label="Tài khoản"
            className="hidden min-h-11 min-w-11 items-center justify-center border border-transparent transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-primary-neon focus-visible:bio-focus sm:flex"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileNavigationOpen(true)}
            aria-label="Mở menu điều hướng"
            aria-expanded={isMobileNavigationOpen}
            className="flex min-h-10 min-w-10 items-center justify-center border border-white/[0.07] bg-white/[0.03] transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus sm:min-h-11 sm:min-w-11 lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </Container>

      <MobileNavigation
        cartCount={totalItemsCount}
        isOpen={isMobileNavigationOpen}
        onClose={closeMobileNavigation}
        onSearch={openSearchFromMobileNavigation}
        pathname={pathname}
      />
    </header>
  );
};
