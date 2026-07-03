"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, Heart, MapPin, 
  Settings, Bell, LogOut, LayoutDashboard, Activity 
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { cn } from "@/lib/utils";

const ACCOUNT_MENU = [
  { label: "Bảng Điều Khiển", href: "/account", icon: LayoutDashboard },
  { label: "Lịch Sử Đơn Hàng", href: "/account/orders", icon: Package },
  { label: "Sản Phẩm Yêu Thích", href: "/account/wishlist", icon: Heart },
  { label: "SỔ ĐỊA CHỈ", href: "/account/addresses", icon: MapPin },
  { label: "Thông Báo", href: "/account/notifications", icon: Bell },
  { label: "Thiết Lập Bảo Mật", href: "/account/settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { addToast } = useOverlayStore();
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [labPosition, setLabPosition] = useState<string>("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (isMounted) window.location.href = "/login"; // Chuyển mạch cứng an toàn
      } else {
        if (isMounted) {
          const user = session.user;
          setUserEmail(user.email ?? "Cyber_User");
          setFullName(user.user_metadata?.full_name || "");
          setAvatarUrl(user.user_metadata?.avatar_url || "");
          setLabPosition(user.user_metadata?.lab_position || "VERIFIED CLIENT");
          setIsCheckingAuth(false);
        }
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === "SIGNED_OUT" || !session) {
        setUserEmail(null);
        setFullName("");
        setAvatarUrl("");
        setLabPosition("");
        window.location.href = "/login"; // Chuyển mạch cứng chặn đứng lỗi fetch mồ côi
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================================
  // ⚡ TƯ DUY ĐỘT PHÁ: THANH TRỪNG THỦ CÔNG & ĐIỀU HƯỚNG CỨNG (HARD RESET)
  // =========================================================================
  const handleLogout = () => {
    // 1. Quét sạch toàn bộ phôi khóa Token của Supabase lưu trong LocalStorage nhằm bẻ gãy phiên làm việc lập tức
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    addToast({ 
      title: "ĐĂNG XUẤT", 
      description: "Đã hủy phiên làm việc mã hóa bằng phương pháp Hard Reset.", 
      type: "INFO" 
    });

    // 2. Ép trình duyệt chuyển hướng cứng giải phóng 100% RAM bộ đệm cũ, chặn đứng hoàn toàn màng lỗi Next.js Overlay!
    window.location.href = "/login";
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
              {ACCOUNT_MENU.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 font-mono text-xs uppercase tracking-widest border-l-2 transition-all",
                      pathname === item.href 
                        ? "bg-primary-neon/10 border-primary-neon text-primary-neon font-bold shadow-neon-cyan/10" 
                        : "border-transparent text-text-dark hover:bg-white/5 hover:text-text-pure"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
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