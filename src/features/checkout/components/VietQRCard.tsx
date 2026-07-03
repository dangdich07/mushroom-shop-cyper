"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { QrCode, Copy, Check, Clock, AlertTriangle, Activity } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface VietQRCardProps {
  orderId: string;
  grandTotal: number;
  qrUrl: string;
  referenceCode: string;
}

// Cấu trúc mô tả payload an toàn nhận về từ cổng thay đổi Supabase Real-time
interface RealtimePaymentPayload {
  status: string;
  order_id: string;
}

export function VietQRCard({ orderId, grandTotal, qrUrl, referenceCode }: VietQRCardProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<"AMOUNT" | "REF" | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút Lease đếm ngược tính bằng giây

  // 1. KÍCH HOẠT KÊNH LẮNG NGHE REAL-TIME TỪ TẦNG SÂU DATABASE
  useEffect(() => {
    const paymentChannel = supabase
      .channel(`realtime-payment:${orderId}`)
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "payments", 
          filter: `order_id=eq.${orderId}` 
        },
        (payload) => {
          const updatedPayment = payload.new as RealtimePaymentPayload;
          // Nếu trạng thái ví nhảy sang PAID ➔ Ép chuyển hướng hỏa tốc sang trang thành công
          if (updatedPayment && updatedPayment.status === "PAID") {
            router.push(`/checkout/success?orderId=${orderId}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentChannel);
    };
  }, [orderId, router]);

  // 2. BỘ ĐẾM NGƯỢC TIMEOUT 15 PHÚT HỦY PHỄU
  useEffect(() => {
    if (timeLeft <= 0) {
      router.push("/cart?error=TIMEOUT");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const copyToClipboard = (text: string, field: "AMOUNT" | "REF") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-[#090d16] border border-white/10 p-6 flex flex-col items-center gap-5 text-xs font-mono relative overflow-hidden">
      
      {/* HEADER BAR THẺ CHỨA BỘ ĐẾM GIỜ */}
      <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-primary-cyan font-bold tracking-widest uppercase flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-primary-cyan" /> CỔNG QUYẾT TOÁN LƯỢNG TỬ VIETQR
        </span>
        <span className="text-red-400 font-bold flex items-center gap-1 bg-red-500/5 px-2 py-0.5 border border-red-500/10">
          <Clock className="w-3.5 h-3.5" /> HẠN: {formatTime(timeLeft)}
        </span>
      </div>

      {/* KHU VỰC KẾT XUẤT MÃ QR ĐỘNG CHUẨN EMVCO */}
      <div className="relative p-3 bg-white rounded-sm border-2 border-primary-cyan/30 shadow-[0_0_20px_rgba(0,245,255,0.05)]">
        {qrUrl ? (
          <img src={qrUrl} alt="VietQR CyberMushroom Generator" className="w-56 h-56 object-contain" />
        ) : (
          <div className="w-56 h-56 flex flex-col items-center justify-center text-background-deep text-center p-2">
            <Activity className="w-6 h-6 animate-spin text-background-deep mb-2" />
            <span className="text-[10px] font-bold uppercase">Đang đồng bộ phôi QR...</span>
          </div>
        )}
        {timeLeft < 60 && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
            <span className="text-text-pure font-bold uppercase text-[10px] mt-2">Mã vận đơn sắp hết thời hạn an toàn</span>
          </div>
        )}
      </div>

      <p className="text-text-dark text-center max-w-xs leading-relaxed text-[11px] uppercase">
        Sử dụng ứng dụng Ngân hàng (Mobile Banking) quét mã QR động để tự động điền thông số tài chính chính xác.
      </p>

      {/* KHỐI ĐỐI SOÁT ĐĂNG KÝ SAO CHÉP THỦ CÔNG CỦA USER */}
      <div className="w-full flex flex-col gap-2 bg-black/40 p-4 border border-white/5">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-text-dark uppercase text-[10px]">Số tiền cần thanh toán:</span>
          <div className="flex items-center gap-1.5">
            <strong className="text-primary-cyan font-black text-sm">{formatVND(grandTotal)}</strong>
            <button 
              type="button" 
              onClick={() => copyToClipboard(grandTotal.toString(), "AMOUNT")} 
              className="text-text-dark hover:text-text-pure transition-colors cursor-pointer"
            >
              {copiedField === "AMOUNT" ? <Check className="w-3.5 h-3.5 text-primary-neon" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-text-dark uppercase text-[10px]">Nội dung bắt buộc ghi:</span>
          <div className="flex items-center gap-1.5">
            <strong className="text-text-pure font-black uppercase bg-white/5 px-2 py-0.5 border border-white/10 tracking-wider">{referenceCode}</strong>
            <button 
              type="button" 
              onClick={() => copyToClipboard(referenceCode, "REF")} 
              className="text-text-dark hover:text-text-pure transition-colors cursor-pointer"
            >
              {copiedField === "REF" ? <Check className="w-3.5 h-3.5 text-primary-neon" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM RADAR BEACON PING STATUS */}
      <div className="w-full py-3 border border-dashed border-white/10 flex items-center justify-center gap-2 bg-white/5">
        <Activity className="w-3.5 h-3.5 text-primary-cyan animate-spin" />
        <span className="text-[10px] text-text-dark uppercase tracking-widest animate-pulse">
          Hệ thống đang quét tín hiệu ngân hàng real-time...
        </span>
      </div>

    </div>
  );
}