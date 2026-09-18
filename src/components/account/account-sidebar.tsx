import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccountNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AccountSidebarProps {
  items: AccountNavigationItem[];
  pathname: string;
  onLogout: () => void;
}

export function AccountSidebar({ items, onLogout, pathname }: AccountSidebarProps) {
  return (
    <nav className="glass-card flex overflow-hidden" aria-label="Điều hướng tài khoản">
      <div className="flex w-full flex-col">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 min-w-0 items-center gap-3 border-l-2 px-5 py-3 font-mono text-xs uppercase tracking-wider focus-visible:bio-focus", active ? "border-primary-neon bg-primary-neon/10 font-bold text-primary-neon" : "border-transparent text-text-dark hover:bg-white/5 hover:text-text-pure")}>
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 break-words">{item.label}</span>
              {active && <span className="shrink-0 border border-primary-neon/30 px-1.5 py-0.5 text-[8px]">Đang mở</span>}
            </Link>
          );
        })}
        <button type="button" onClick={onLogout} className="flex min-h-12 w-full items-center gap-3 border-l-2 border-transparent px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-red-500 hover:bg-red-500/10 focus-visible:bio-focus">
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" /> Đăng Xuất Hệ Thống
        </button>
      </div>
    </nav>
  );
}
