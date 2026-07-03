"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Key } from "lucide-react"; // Đã dọn dẹp Terminal và ShieldCheck để xử lý lỗi unused-vars

export default function LoginPage() {
  const router = useRouter();
  const { addToast, setGlobalLoading } = useOverlayStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ title: "LỖI TRUY CẬP", description: "Vui lòng nhập đầy đủ thông tin mã hóa.", type: "ERROR" });
      return;
    }

    setGlobalLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        addToast({ title: "ĐĂNG KÝ THÀNH CÔNG", description: "Vui lòng kiểm tra hòm thư để kích hoạt bản thể tài khoản.", type: "SUCCESS" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast({ title: "KẾT NỐI THÀNH CÔNG", description: "Đã xác thực danh tính. Đang đồng bộ hóa luồng thông tin...", type: "SUCCESS" });
        router.push("/account");
      }
    } catch (err: unknown) { // Chuyển từ 'any' sang 'unknown' để vượt qua bộ lọc khắt khe của ESLint
      const errorMessage = err instanceof Error ? err.message : "Xung đột thông tin xác thực.";
      addToast({ title: "BẺ GÃY KẾT NỐI", description: errorMessage, type: "ERROR" });
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center py-12 relative overflow-hidden">
        <Container className="max-w-md w-full">
          <div className="glass-premium p-6 sm:p-8 border border-primary-neon/20 flex flex-col gap-6 relative">
            
            {/* Header Terminal Card */}
            <div className="text-center flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-primary-neon/10 border border-primary-neon/30 text-primary-neon flex items-center justify-center mb-2">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest">Hệ Thống Định Danh Trung Tâm</span>
              <h2 className="text-xl font-heading font-black text-text-pure uppercase tracking-wide">
                {isSignUp ? "Khởi Tạo Bản Thể" : "Mã Hóa Danh Tính"}
              </h2>
            </div>

            {/* Input Form Fields */}
            <form onSubmit={handleAuthAction} className="flex flex-col gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-dark uppercase tracking-wider">Cổng Email Tài Khoản</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-background-dark border border-white/10 p-3 text-text-pure focus:border-primary-neon outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-dark uppercase tracking-wider">Mật Mã Khóa Lõi</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-background-dark border border-white/10 p-3 text-text-pure focus:border-primary-neon outline-none"
                />
              </div>

              <button type="submit" className="h-11 bg-primary-neon text-background-deep font-bold uppercase tracking-widest shadow-neon-cyan hover:bg-primary-cyan transition-colors mt-2 cursor-pointer">
                {isSignUp ? "KÍCH HOẠT ĐĂNG KÝ" : "XÁC THỰC TRUY CẬP"}
              </button>
            </form>

            {/* Switch Mode Anchor */}
            <div className="border-t border-white/5 pt-4 text-center font-mono text-[10px]">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-text-dark hover:text-primary-neon transition-colors underline cursor-pointer"
              >
                {isSignUp ? "Đã có nhận dạng cấu trúc? Đăng nhập ngay" : "Chưa có nhận dạng cấu trúc? Đăng ký bản thể mới"}
              </button>
            </div>

          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}