"use client";

import React, { useEffect } from "react";
import Link from "next/link"; // Đã bổ sung import Link tối ưu định tuyến nội bộ
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { Container } from "@/components/layout/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical System Breach:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-deep pt-20">
      <Container className="text-center flex flex-col items-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center text-red-500 animate-bounce">
            <AlertOctagon className="w-10 h-10" />
          </div>
          <div className="absolute inset-0 bg-red-500 blur-[40px] opacity-20" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-heading font-black text-text-pure uppercase tracking-tight">
            Phát hiện xung đột <span className="text-red-500">Lõi Hệ Thống</span>
          </h2>
          <p className="text-text-dark font-body max-w-lg mx-auto">
            Tiến trình bóc tách dữ liệu tơ nấm gặp lỗi nghiêm trọng do xung đột mã nguồn runtime. 
            Vui lòng thử tái thiết lập luồng vận hành.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-white/5 border border-white/10 text-text-pure font-mono text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Tái khởi động tiến trình
          </button>
          
          {/* Sửa từ thẻ <a> thành <Link> để Next.js prefetch dữ liệu không làm reload trang */}
          <Link
            href="/"
            className="px-6 py-3 bg-primary-neon text-background-deep font-mono text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-neon-cyan transition-all"
          >
            <Home className="w-4 h-4" /> Rút lui về trang chủ
          </Link>
        </div>
      </Container>
    </div>
  );
}