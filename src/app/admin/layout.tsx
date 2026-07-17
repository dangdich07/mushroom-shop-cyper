"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package, LogOut, LayoutDashboard, Activity, Layers,
  MessageSquare, Users, Tag, ShieldAlert
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { cn } from "@/lib/utils";

const ADMIN_MENU = [
  { label: "Tổng Quan", href: "/admin", icon: LayoutDashboard },
  { label: "Đơn Hàng", href: "/admin/orders", icon: Layers },
  { label: "Sản Phẩm", href: "/admin/products", icon: Package },
  { label: "Đánh Giá", href: "/admin/reviews", icon: MessageSquare },
  { label: "Người Dùng", href: "/admin/users", icon: Users },
  { label: "Mã Giảm Giá", href: "/admin/vouchers", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useOverlayStore();
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [labPosition, setLabPosition] = useState<string>("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?next=/admin");
      } else {
        const user = session.user;
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, lab_position, role")
          .eq("id", user.id)
          .single();

        if (error || !profile || !["admin", "super_admin"].includes(profile.role)) {
          addToast({ title: "TỪ CHỐI TRUY CẬP", description: "Tài khoản không có đặc quyền quản trị.", type: "ERROR" });
          router.replace("/account");
          return;
        }
        setUserEmail(user.email ?? "Cyber_User");
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setAvatarUrl(profile.avatar_url || user.user_metadata?.avatar_url || "");
        setLabPosition(profile.lab_position || profile.role.toUpperCase());
        setIsCheckingAuth(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUserEmail(null);
        setFullName("");
        setAvatarUrl("");
        setLabPosition("");
        router.replace("/login?next=/admin");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addToast, router]);

  //  VÁ LỖI CHÍ MẠNG: Bọc màng an ninh chống crash giao diện khi mất kết nối Cloud
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      addToast({ title: "ĐĂNG XUẤT", description: "Đã hủy phiên làm việc mã hóa an toàn.", type: "INFO" });
    } catch (err: unknown) {
      // Trích xuất tin nhắn lỗi thật hoặc bắt lỗi rớt mạng
      const rawMessage = err instanceof Error ? err.message : "Mất tín hiệu kết nối đến trạm gác Supabase Cloud.";
      console.warn("[Mạng Yếu/Lỗi Token]: Tiến hành cưỡng bức đăng xuất cục bộ.", rawMessage);
      
      addToast({ 
        title: "ĐĂNG XUẤT CỤC BỘ", 
        description: "Hệ thống đã xóa token bộ đệm và đưa bạn về vùng an toàn.", 
        type: "SUCCESS" 
      });
      
      // Kịch bản dự phòng: Đẩy thẳng kỹ sư về login để giải phóng màn hình crash
      router.push("/login");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-primary-cyan">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Đang giải mã khóa token danh tính bảo mật...
      </div>
    );
  }

  const getInitials = () => {
    if (fullName.trim()) {
      const words = fullName.trim().split(" ");
      if (words.length >= 2) {
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    if (userEmail) {
      return userEmail.substring(0, 2).toUpperCase();
    }
    return "CM";
  };

  return (
    <div className="relative min-h-screen py-10">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="glass-premium p-6 flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full border-2 border-primary-neon p-1 relative overflow-visible">
                <div className="w-full h-full bg-background-dark rounded-full flex items-center justify-center text-primary-neon font-mono text-sm font-black truncate overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Cyber Human Resource Identity" 
                      className="w-full h-full object-cover rounded-full opacity-80"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-neon rounded-full border-4 border-background-deep flex items-center justify-center">
                  <div className="w-2 h-2 bg-background-deep rounded-full animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col max-w-full overflow-hidden">
                <h3 className="font-heading font-bold text-xs text-text-pure uppercase tracking-wide truncate">
                  {fullName || userEmail}
                </h3>
                <span className="text-[10px] font-mono text-primary-cyan uppercase mt-0.5 tracking-widest">
                  Hạng: {labPosition}
                </span>
              </div>
            </div>

            <nav className="glass-card overflow-hidden flex flex-col">
              {ADMIN_MENU.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 font-mono text-xs uppercase tracking-widest border-l-2 transition-all",
                      isActive 
                        ? "bg-primary-neon/10 border-primary-neon text-primary-neon font-bold shadow-neon-cyan/10" 
                        : "border-transparent text-text-dark hover:bg-white/5 hover:text-text-pure"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/account" className="flex items-center gap-3 px-6 py-4 font-mono text-xs uppercase tracking-widest text-text-dark hover:bg-white/5 hover:text-primary-cyan transition-all border-l-2 border-transparent">
                <ShieldAlert className="w-4 h-4" /> Khu Vực Tài Khoản
              </Link>
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-6 py-4 font-mono text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border-l-2 border-transparent cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Đăng Xuất Hệ Thống
              </button>
            </nav>
          </aside>

          <main className="lg:col-span-9 flex flex-col gap-6">
            {children}
          </main>

        </div>
      </Container>
    </div>
  );
}
