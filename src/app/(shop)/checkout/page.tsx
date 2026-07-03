"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { ChevronLeft, Activity } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-10 border-b border-white/5 text-xs font-mono">
        <Container>
          
          {/* THANH ĐIỀU HƯỚNG NGƯỢC DÒNG */}
          <button 
            type="button" 
            onClick={() => router.push("/cart")} 
            className="text-[10px] text-text-dark hover:text-primary-cyan uppercase tracking-widest flex items-center gap-1 mb-6 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> HOÀN TÁC VỀ KHAY NGHIỆM THU
          </button>

          {/* TIÊU ĐỀ PHÂN KHU */}
          <div className="flex flex-col gap-2 mb-8 border-b border-white/5 pb-6">
            <span className="text-[10px] text-primary-cyan uppercase tracking-widest">Giao Thức Bảo Mật Production</span>
            <h1 className="text-3xl font-heading font-black uppercase text-text-pure tracking-tight">Phễu Quyết Toán Sinh Khối</h1>
          </div>

          {/* KÍCH HOẠT THÀNH PHẦN HOÀN CHỈNH MỚI 
            Bọc trong Suspense để xử lý màng bọc useSearchParams() của Next.js 15 không bị lỗi Prerender Static Error
          */}
          <Suspense fallback={
            <div className="py-20 flex items-center justify-center text-primary-neon animate-pulse">
              <Activity className="w-4 h-4 animate-spin mr-2" /> Đang thiết lập trục an ninh biểu mẫu quyết toán...
            </div>
          }>
            <CheckoutForm />
          </Suspense>

        </Container>
      </div>
    </PageWrapper>
  );
}