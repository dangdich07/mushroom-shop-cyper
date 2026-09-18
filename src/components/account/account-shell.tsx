"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Heart, LayoutDashboard, MapPin, Package, Settings } from "lucide-react";
import { AccountIdentityCard } from "./account-identity-card";
import { AccountMobileNav } from "./account-mobile-nav";
import { AccountSidebar } from "./account-sidebar";
import { Container } from "@/components/layout/container";
import { supabase } from "@/lib/supabaseClient";

const ACCOUNT_MENU = [
  { label: "Bảng Điều Khiển", href: "/account", icon: LayoutDashboard },
  { label: "Lịch Sử Đơn Hàng", href: "/account/orders", icon: Package },
  { label: "Sản Phẩm Yêu Thích", href: "/account/wishlist", icon: Heart },
  { label: "Sổ Địa Chỉ", href: "/account/addresses", icon: MapPin },
  { label: "Thông Báo", href: "/account/notifications", icon: Bell },
  { label: "Thiết Lập Bảo Mật", href: "/account/settings", icon: Settings },
];

interface AccountShellProps {
  avatarUrl: string;
  children: ReactNode;
  displayName: string;
  email: string;
  position: string;
}

export function AccountShell({ avatarUrl, children, displayName, email, position }: AccountShellProps) {
  const pathname = usePathname();
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const initialsSource = displayName.trim() || email.trim();
  const initials = initialsSource ? initialsSource.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() : "CM";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutError("Không thể đăng xuất lúc này. Vui lòng thử lại.");
      setLoggingOut(false);
      return;
    }
    window.location.href = "/login";
  };

  return (
    <div className="relative min-h-screen min-w-0 overflow-x-clip py-6 sm:py-10">
      <Container>
        {logoutError && <p role="alert" className="mb-4 border border-red-500/20 bg-red-500/5 p-3 font-mono text-xs text-red-400">{logoutError}</p>}
        <div aria-busy={loggingOut} className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <AccountMobileNav items={ACCOUNT_MENU} pathname={pathname} onLogout={handleLogout} />
          <aside className="hidden min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:col-span-3 lg:flex">
            <AccountIdentityCard avatarUrl={avatarUrl} displayName={displayName || email} initials={initials} position={position || "Chưa thiết lập"} />
            <AccountSidebar items={ACCOUNT_MENU} pathname={pathname} onLogout={handleLogout} />
          </aside>
          <main className="flex min-w-0 flex-col gap-6 lg:col-span-9">{children}</main>
        </div>
      </Container>
    </div>
  );
}
