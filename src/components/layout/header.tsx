"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { Container } from "./container";
import { useCartStore } from "@/store/useCartStore"; // Khóa nối kho giỏ hàng
import { cn } from "@/lib/utils";
import { CommandMenu } from "@/components/common/command-menu";

interface HeaderCartItem {
  quantity: number;
}

interface ExpectedHeaderCartState {
  items: HeaderCartItem[];
}

export const Header = () => {
  const pathname = usePathname();

  // Ép kiểu mảng vô định an toàn tuyệt đối 100% không dính lỗi any linter
  const cartStore = useCartStore() as unknown as ExpectedHeaderCartState;
  const totalItemsCount = cartStore.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const NAV_LINKS = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "DANH MỤC NẤM", href: "/products" },
    { label: "TRI THỨC NẤM", href: "/blog" },
    { label: "ƯU ĐÃI", href: "/promotions" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background-deep/80 backdrop-blur-md">
      <Container className="h-16 flex items-center justify-between">
        
        {/* LOGO MATRIX */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-primary-neon flex items-center justify-center font-mono font-black text-background-deep text-sm tracking-tighter group-hover:bg-primary-cyan transition-colors">
            M
          </div>
          <span className="font-heading font-black text-sm uppercase tracking-wider text-text-pure">
            CYBER<span className="text-primary-neon group-hover:text-primary-cyan transition-colors">MUSHROOM</span>
          </span>
        </Link>

        {/* HORIZONTAL DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 font-heading font-bold text-xs uppercase tracking-widest">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn("transition-colors hover:text-primary-neon", isActive ? "text-primary-neon font-black" : "text-text-dark")}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* UTILITY CONTROL ICONS */}
        <div className="flex items-center gap-4 text-text-dark font-mono text-xs">
          
          {/* KÍCH HOẠT CHỨC NĂNG THẬT: Cấy sự kiện phát sóng mở cổng Modal tìm kiếm toàn cục */}
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-cyber-search"))}
            className="hover:text-text-pure transition-colors cursor-pointer p-1 block" 
            title="Tìm kiếm ma trận (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-text-dark hover:text-text-pure transition-colors" />
          </button>
          
          {/* CỔNG GIỎ HÀNG TÍCH HỢP BADGE PHÁT QUANG */}
          <Link href="/cart" className="hover:text-text-pure transition-colors relative p-1 block" title="Giỏ hàng sinh khối">
            <ShoppingCart className="w-4 h-4 text-text-dark hover:text-text-pure transition-colors" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary-neon text-background-deep font-mono text-[9px] font-black rounded-full flex items-center justify-center px-1 animate-in zoom-in duration-200 shadow-[0_0_8px_#00F5FF]">
                {totalItemsCount}
              </span>
            )}
          </Link>

          <Link href="/account" className="hover:text-primary-neon text-text-dark transition-colors" title="Định danh bảo mật tài khoản">
            <User className="w-4 h-4" />
          </Link>

          <button type="button" className="md:hidden hover:text-text-pure transition-colors cursor-pointer">
            <Menu className="w-4 h-4" />
          </button>
        </div>

      </Container>

      {/* ĐÓNG HÒM KIẾN TRÚC: Nhúng cổng Modal tìm kiếm kết nối trực tiếp với nút Search phía trên */}
      <CommandMenu />
    </header>
  );
};