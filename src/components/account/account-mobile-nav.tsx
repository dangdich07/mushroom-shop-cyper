import Link from "next/link";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountNavigationItem } from "./account-sidebar";

interface AccountMobileNavProps {
  items: AccountNavigationItem[];
  pathname: string;
  onLogout: () => void;
}

export function AccountMobileNav({ items, onLogout, pathname }: AccountMobileNavProps) {
  const activeItem = items.find((item) => item.href === pathname) ?? items[0];
  return (
    <details className="group glass-card min-w-0 lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider text-text-pure focus-visible:bio-focus">
        <Menu aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-cyan" />
        <span className="min-w-0 flex-1 break-words">{activeItem.label}</span>
        <span className="border border-primary-neon/30 px-1.5 py-0.5 text-[8px] text-primary-neon">Đang mở</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <nav className="grid grid-cols-1 border-t border-white/5 sm:grid-cols-2" aria-label="Điều hướng tài khoản trên thiết bị di động">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 min-w-0 items-center gap-3 border border-transparent px-4 py-3 font-mono text-[10px] uppercase tracking-wider focus-visible:bio-focus", active ? "bg-primary-neon/10 font-bold text-primary-neon outline outline-1 outline-primary-neon/30" : "text-text-dark hover:bg-white/5 hover:text-text-pure")}><Icon aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="break-words">{item.label}</span></Link>;
        })}
        <button type="button" onClick={onLogout} className="flex min-h-12 items-center gap-3 px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-red-500 hover:bg-red-500/10 focus-visible:bio-focus"><LogOut aria-hidden="true" className="h-4 w-4" /> Đăng Xuất Hệ Thống</button>
      </nav>
    </details>
  );
}
