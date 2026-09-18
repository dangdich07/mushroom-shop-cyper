"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import type { AdminIdentity } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children, identity }: { children: React.ReactNode; identity: AdminIdentity }) {
  const router = useRouter();
  const { addToast } = useOverlayStore();
  const [logoutPending, setLogoutPending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen]);

  async function logout() {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      addToast({ title: "ĐĂNG XUẤT", description: "Đã kết thúc phiên làm việc quản trị.", type: "INFO" });
      router.replace("/login");
      router.refresh();
    } catch {
      addToast({ title: "KHÔNG THỂ ĐĂNG XUẤT", description: "Vui lòng thử lại sau.", type: "ERROR" });
      setLogoutPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full min-w-0 bg-background-deep">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng điều hướng quản trị"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-[min(19rem,86vw)] transition-transform duration-300 motion-reduce:transition-none lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:shrink-0 lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"}`}>
        <AdminSidebar
          identity={identity}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onNavigate={() => setMobileSidebarOpen(false)}
          onLogout={logout}
          logoutPending={logoutPending}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-white/5 bg-background-deep/95 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMobileSidebarOpen(true)} aria-label="Mở điều hướng quản trị" className="flex min-h-11 min-w-11 items-center justify-center border border-white/10 text-text-pure focus-visible:bio-focus">
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
          <div><p className="font-heading text-xs font-black uppercase tracking-widest text-text-pure">CyberMushroom</p><p className="font-mono text-[9px] uppercase tracking-widest text-primary-cyan">Admin console</p></div>
        </div>
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
