"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, Layers, LayoutDashboard, LogOut, Mail, MessageSquare, Package, PanelLeftClose, PanelLeftOpen, Tag, Users, X } from "lucide-react";
import type { AdminIdentity } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/theme-toggle";

const MENU = [
  { label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { label: "Đơn hàng", href: "/admin/orders", icon: Layers },
  { label: "Sản phẩm", href: "/admin/products", icon: Package },
  { label: "Đánh giá", href: "/admin/reviews", icon: MessageSquare },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Mã giảm giá", href: "/admin/vouchers", icon: Tag },
  { label: "Bản tin", href: "/admin/newsletter", icon: Mail },
] as const;

function initials(identity: AdminIdentity) {
  const source = identity.fullName.trim() || identity.email.trim() || "CM";
  const words = source.split(/\s+/);
  return words.length > 1 ? `${words[0][0]}${words.at(-1)?.[0] ?? ""}`.toUpperCase() : source.slice(0, 2).toUpperCase();
}

interface AdminSidebarProps {
  collapsed: boolean;
  identity: AdminIdentity;
  logoutPending: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
  onNavigate: () => void;
}

export function AdminSidebar({ collapsed, identity, logoutPending, onCollapsedChange, onLogout, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <aside className="flex h-full min-w-0 flex-col border-r border-primary-neon/15 bg-surface-base/98 shadow-[12px_0_40px_rgba(0,0,0,.18)]">
      <div className={cn("flex min-h-20 items-center border-b border-white/5 px-4", collapsed ? "lg:justify-center lg:px-2" : "justify-between")}>
        <Link href="/admin" onClick={onNavigate} className={cn("min-w-0 focus-visible:bio-focus", collapsed && "lg:hidden")}>
          <p className="font-heading text-sm font-black uppercase tracking-widest text-text-pure">Cyber<span className="text-primary-neon">Mushroom</span></p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[.24em] text-text-dark">Admin console</p>
        </Link>
        <button type="button" onClick={onNavigate} aria-label="Đóng điều hướng" className="flex min-h-11 min-w-11 items-center justify-center text-text-dark hover:text-text-pure focus-visible:bio-focus lg:hidden"><X aria-hidden="true" className="h-5 w-5" /></button>
        <button type="button" onClick={() => onCollapsedChange(!collapsed)} aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"} aria-expanded={!collapsed} className="hidden min-h-11 min-w-11 items-center justify-center border border-white/10 text-text-dark hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus lg:flex">
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="h-5 w-5" /> : <PanelLeftClose aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-b border-white/5 p-4", collapsed && "lg:px-2")}>
        <div className={cn("flex min-w-0 items-center gap-3", collapsed && "lg:justify-center")}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-neon/60 bg-background-dark font-mono text-xs font-black text-primary-neon">
            {identity.avatarUrl && !avatarFailed ? <img src={identity.avatarUrl} alt="Ảnh đại diện quản trị viên" onError={() => setAvatarFailed(true)} className="h-full w-full object-cover" /> : initials(identity)}
          </div>
          <div className={cn("min-w-0", collapsed && "lg:hidden")}><p className="truncate font-heading text-xs font-bold uppercase text-text-pure">{identity.fullName || identity.email}</p><p className="mt-1 truncate font-mono text-[9px] uppercase tracking-wider text-primary-cyan">{identity.labPosition}</p></div>
        </div>
      </div>

      <nav aria-label="Điều hướng quản trị" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-12 items-center gap-3 border-l-2 px-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:bio-focus motion-reduce:transition-none", collapsed && "lg:justify-center lg:px-2", active ? "border-primary-neon bg-primary-neon/10 text-primary-neon" : "border-transparent text-text-dark hover:bg-white/5 hover:text-text-pure")}>
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>{item.label}</span>
              {active && !collapsed && <ChevronRight aria-hidden="true" className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <ThemeToggle compact={collapsed} className={cn("w-full justify-start border-l-2 px-3", collapsed && "lg:justify-center lg:px-2")} />
        <Link href="/" onClick={onNavigate} title={collapsed ? "Về cửa hàng" : undefined} className={cn("flex min-h-12 items-center gap-3 border-l-2 border-transparent px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-cyan hover:bg-primary-cyan/10 focus-visible:bio-focus", collapsed && "lg:justify-center lg:px-2")}><ExternalLink aria-hidden="true" className="h-5 w-5 shrink-0" /><span className={cn("flex-1", collapsed && "lg:hidden")}>Về cửa hàng</span>{!collapsed && <ChevronLeft aria-hidden="true" className="h-4 w-4" />}</Link>
        <button type="button" onClick={onLogout} disabled={logoutPending} title={collapsed ? "Đăng xuất" : undefined} className={cn("flex min-h-12 w-full items-center gap-3 border-l-2 border-transparent px-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 focus-visible:bio-focus disabled:opacity-50", collapsed && "lg:justify-center lg:px-2")}><LogOut aria-hidden="true" className="h-5 w-5 shrink-0" /><span className={cn("flex-1", collapsed && "lg:hidden")}>{logoutPending ? "Đang đăng xuất..." : "Đăng xuất"}</span></button>
      </div>
    </aside>
  );
}
