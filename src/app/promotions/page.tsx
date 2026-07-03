"use client";

import React, { useState, useEffect } from "react";
import { Award, ShieldAlert, Ticket, User, Zap } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { LuckyWheel } from "@/components/promotion/lucky-wheel";
import { MOCK_SYSTEM_VOUCHERS } from "@/data/promotions";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore"; // Khóa liên thông trạng thái
import { useOverlayStore } from "@/store/useOverlayStore"; // Hệ thống thông báo Toasts

interface ExpectedCartStore {
  appliedVoucher: { code: string } | null;
  applyVoucher: (voucher: {
    code: string;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    minSubtotal: number;
    description: string;
    expiryDate: string;
  }) => void;
}

export default function PromotionsPage() {
  const { addToast } = useOverlayStore();
  const cartStore = useCartStore() as unknown as ExpectedCartStore;
  
  const [vouchers, setVouchers] = useState(MOCK_SYSTEM_VOUCHERS);

  // ĐỒNG BỘ TRẠNG THÁI KHÔNG PHÁ VỠ: Kiểm tra nếu giỏ hàng đã gài sẵn mã từ trước, tự động chuyển UI sang "Đã Thu"
  useEffect(() => {
    if (cartStore.appliedVoucher) {
      setVouchers(prev =>
        prev.map(v => (v.code === cartStore.appliedVoucher?.code ? { ...v, isClaimed: true } : v))
      );
    }
  }, [cartStore.appliedVoucher]);

  const handleClaimVoucher = (id: string) => {
    const targetVoucher = vouchers.find(v => v.id === id);
    if (!targetVoucher) return;

    // 1. Cập nhật trạng thái giao diện cục bộ theo thiết kế của bạn
    setVouchers(prev =>
      prev.map(v => (v.id === id ? { ...v, isClaimed: true } : v))
    );

    // 2. KẾT NỐI CHỨC NĂNG THẬT SỰ: Ánh xạ cấu trúc sang mô hình tính toán tài chính của Giỏ hàng
    if (cartStore.applyVoucher) {
      cartStore.applyVoucher({
        code: targetVoucher.code,
        discountType: targetVoucher.code.toUpperCase().includes("10") ? "PERCENT" : "FIXED",
        discountValue: targetVoucher.code.toUpperCase().includes("10") ? 10 : 50000,
        minSubtotal: targetVoucher.minOrderValue,
        description: targetVoucher.description,
        expiryDate: targetVoucher.endDate
      });

      addToast({
        title: "THU NHẬN THÀNH CÔNG",
        description: `Mật mã ưu đãi ${targetVoucher.code} đã được cấy vào lõi quyết toán giỏ hàng.`,
        type: "SUCCESS"
      });
    }
  };

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-10">
        <Container>
          {/* TIÊU ĐỀ PHÂN HỆ KHUYẾN MÃI */}
          <div className="flex flex-col gap-2 mb-10 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Trung Tâm Phân Phối Ưu Đãi</span>
            <h1 className="text-3xl font-heading font-black uppercase text-text-pure tracking-tight">Promotions & Gamification Hub</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CỘT TRÁI: VOUCHER TICKETS & MEMBERSHIP (8 CỘT) */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              
              {/* KHU VỰC 1: VOUCHER CENTER */}
              <div className="flex flex-col gap-4">
                <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-text-pure flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-primary-neon" /> Trung Tâm Thu Nhận Vé Ưu Đãi
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vouchers.map((v) => (
                    <div 
                      key={v.id} 
                      className={`glass-card p-5 relative overflow-hidden flex justify-between items-center border-l-4 ${
                        v.isClaimed ? "border-l-text-dark opacity-60" : "border-l-primary-neon shadow-neon-cyan/5"
                      }`}
                    >
                      {/* Thiết kế vết cắt răng cưa vé điện tử */}
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background-deep border border-white/5" />
                      
                      <div className="flex flex-col gap-1.5 pr-6 max-w-[75%]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-0.5 text-text-pure font-bold">
                            {v.code}
                          </span>
                          <span className="text-[10px] font-mono text-text-dark">Hạn: {v.endDate}</span>
                        </div>
                        <h4 className="font-heading font-bold text-sm text-text-pure uppercase tracking-wide truncate">{v.title}</h4>
                        <p className="text-xs text-text-dark font-body leading-tight">{v.description}</p>
                        <p className="text-[10px] font-mono text-primary-cyan mt-1 uppercase">
                          Đơn tối thiểu: {formatVND(v.minOrderValue)}
                        </p>
                      </div>

                      {/* Nút hành động kiểm soát không nút giả */}
                      <button
                        type="button"
                        disabled={v.isClaimed}
                        onClick={() => handleClaimVoucher(v.id)}
                        className={`px-3 py-2 font-mono text-[10px] uppercase font-bold border transition-colors shrink-0 cursor-pointer ${
                          v.isClaimed
                            ? "bg-transparent border-white/5 text-text-dark cursor-not-allowed"
                            : "bg-primary-neon text-background-deep border-primary-neon hover:bg-transparent hover:text-primary-neon"
                        }`}
                      >
                        {v.isClaimed ? "Đã Thu" : "Thu Nhận"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* KHU VỰC 2: MEMBERSHIP UI / REWARD POINTS */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-8">
                <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-text-pure flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-secondary-purple" /> Đẳng Cấp Thành Viên Định Danh
                </h2>
                
                <div className="w-full glass-premium p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Tổng quan điểm ví */}
                  <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0">
                    <div className="w-12 h-12 bg-secondary-purple/10 border border-secondary-purple/30 text-secondary-purple flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-text-dark uppercase">Bản thể tài khoản</span>
                      <span className="font-heading font-black text-sm text-text-pure uppercase tracking-wide">Cyber_Mushroom_User</span>
                      <span className="font-mono text-xs text-secondary-purple font-bold mt-0.5">Ví: 350 Điểm Thưởng</span>
                    </div>
                  </div>

                  {/* Tiến trình cấp bậc */}
                  <div className="md:col-span-2 flex flex-col gap-2 w-full">
                    <div className="flex justify-between font-mono text-[10px] text-text-dark uppercase">
                      <span>Cấp độ: <span className="text-primary-neon font-bold">NEON TIER</span></span>
                      <span>Hành trình đến CYBER TIER: 350 / 500 Pts</span>
                    </div>
                    {/* Thanh lực tiến trình */}
                    <div className="w-full h-2 bg-white/5 border border-white/5 relative">
                      <div className="h-full bg-gradient-to-r from-secondary-purple to-primary-neon w-[70%] shadow-[0_0_8px_#00F5FF]" />
                    </div>
                    <p className="text-[11px] text-text-dark font-body leading-tight mt-1 flex items-start gap-1">
                      <Zap className="w-3.5 h-3.5 text-primary-neon shrink-0" />
                      Quyền lợi Neon Tier: Tự động hoàn 1.5% điểm thưởng vào ví trên mỗi hóa đơn quyết toán sinh khối nấm thành công.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* CỘT PHẢI: GAMIFICATION LUCKY WHEEL (4 CỘT) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
              <LuckyWheel />
              <div className="border border-dashed border-white/10 p-4 bg-background-card/20 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-text-dark shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-dark font-mono leading-tight uppercase">
                  Quy tắc: Quà tặng trúng thưởng từ vòng quay lượng tử sẽ được đóng gói tự động vào kho hàng cá nhân và tự động trừ chi phí điểm ví thành viên.
                </p>
              </div>
            </div>

          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}