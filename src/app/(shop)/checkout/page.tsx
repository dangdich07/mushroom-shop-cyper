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
      <div className="relative min-h-screen min-w-0 overflow-x-clip border-b border-white/5 py-8 font-mono text-xs sm:py-10">
        <Container>
          
          {/* THANH ĐIỀU HƯỚNG NGƯỢC DÒNG */}
          <button 
            type="button" 
            onClick={() => router.push("/cart")} 
            className="mb-6 flex min-h-11 items-center gap-1 text-[10px] uppercase tracking-widest text-text-dark hover:text-primary-cyan focus-visible:bio-focus"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> HOÀN TÁC VỀ KHAY NGHIỆM THU
          </button>

          {/* TIÊU ĐỀ PHÂN KHU */}
          <header className="relative mb-8 flex min-w-0 flex-col gap-2 overflow-hidden border-b border-white/5 pb-6">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-32 w-72 bg-primary-neon/[0.04] blur-3xl" />
            <span className="text-[10px] text-primary-cyan uppercase tracking-widest">Giao Thức Bảo Mật Production</span>
            <h1 className="relative break-words font-heading text-3xl font-black uppercase tracking-tight text-text-pure sm:text-4xl">Phễu Quyết Toán Sinh Khối</h1>
            <p className="relative max-w-2xl break-words text-[10px] uppercase leading-relaxed text-text-dark">Xác nhận thông tin giao nhận và phương thức thanh toán trước khi tạo vận đơn.</p>
          </header>

          {/* KÍCH HOẠT THÀNH PHẦN HOÀN CHỈNH MỚI 
            Bọc trong Suspense để xử lý màng bọc useSearchParams() của Next.js 15 không bị lỗi Prerender Static Error
          */}
          <Suspense fallback={
            <div className="flex min-h-[45vh] items-center justify-center px-4 py-20 text-center text-primary-neon" role="status">
              <Activity aria-hidden="true" className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Đang thiết lập trục an ninh biểu mẫu quyết toán...
            </div>
          }>
            <CheckoutForm />
          </Suspense>

        </Container>
      </div>
    </PageWrapper>
  );
}
