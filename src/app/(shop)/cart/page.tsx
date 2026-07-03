"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatVND } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Activity, AlertTriangle, CheckCircle } from "lucide-react";

// Định nghĩa cấu trúc dữ liệu Voucher khớp với bản thiết kế Admin
interface VerifiedVoucher {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minSubtotal: number;
  description: string;
  expiryDate: string;
}

interface DbVoucherSchema {
  code: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: string | number;
  min_subtotal: string | number;
  description: string | null;
  expiry_date: string;
}

// Khai báo cấu trúc Store dự kiến từ useCartStore
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore() as unknown as CartStore;

  // TRẠNG THÁI XỬ LÝ MÃ GIẢM GIÁ
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VerifiedVoucher | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // TÍNH TOÁN CƠ SỞ ĐƠN HÀNG
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // HÀM KIỂM TOÁN VOUCHER ĐẦU CUỐI
  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setIsValidating(true);
    setVoucherError(null);
    setVoucherSuccess(null);

    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", voucherCode.toUpperCase().trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setVoucherError("Mã ưu đãi không tồn tại trên hệ thống lưu trữ đám mây.");
        setAppliedVoucher(null);
        return;
      }

      const row = data as unknown as DbVoucherSchema;
      const voucher: VerifiedVoucher = {
        code: row.code,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        minSubtotal: Number(row.min_subtotal),
        description: row.description || "",
        expiryDate: row.expiry_date
      };

      // MÀNG LỌC 1: KIỂM TRA NGƯỠNG SÀN SUBTOTAL
      if (subtotal < voucher.minSubtotal) {
        setVoucherError(`Mã này chỉ kích hoạt cho đơn hàng có sinh khối từ ${formatVND(voucher.minSubtotal)} trở lên.`);
        setAppliedVoucher(null);
        return;
      }

      // MÀNG LỌC 2: KIỂM TRA THỜI HẠN ĐÓNG PHỄU (HÔM NAY LÀ 13/06/2026)
      const expiryDateObj = new Date(voucher.expiryDate);
      const currentDateObj = new Date("2026-06-13"); // Ép chặt mốc thời gian thực tế của hệ thống
      
      if (expiryDateObj < currentDateObj) {
        setVoucherError("Phễu ưu đãi này đã quá hạn và bị đóng băng vĩnh viễn.");
        setAppliedVoucher(null);
        return;
      }

      // ĐỦ ĐIỀU KIỆN ➔ THÔNG MẠCH VOUCHER
      setAppliedVoucher(voucher);
      setVoucherSuccess(`Kích hoạt thành công mã [${voucher.code}]: ${voucher.description}`);
    } catch (err) {
      setVoucherError("Lỗi hệ thống trong luồng đối soát cơ sở dữ liệu.");
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  // TÍNH TOÁN KHẤU HAO TÀI CHÍNH
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === "PERCENT") {
      discount = (subtotal * appliedVoucher.discountValue) / 100;
    } else {
      discount = appliedVoucher.discountValue;
    }
  }
  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-12 border-b border-white/5 text-xs font-mono">
        <Container>
          
          {/* TIÊU ĐỀ SECTION */}
          <div className="flex flex-col gap-2 mb-8 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Khay Nghiệm Thu Vật Phẩm</span>
            <h1 className="text-3xl font-heading font-black uppercase text-text-pure tracking-tight">Giỏ Hàng Trung Chuyển</h1>
          </div>

          {items.length === 0 ? (
            <div className="w-full py-24 border border-dashed border-white/10 text-center glass-card flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="w-8 h-8 text-text-dark opacity-30 animate-pulse" />
              <p className="font-heading font-bold text-sm text-text-pure uppercase">Khay trung chuyển đang trống rỗng</p>
              <Link href="/products" className="text-primary-cyan hover:text-primary-neon underline transition-colors uppercase text-[10px] tracking-wider font-bold">
                ➔ Quay lại sàn giao dịch nạp sinh khối
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              
              {/* CỘT TRÁI: DÒNG VẬT PHẨM LEDGER (8 CỘT) */}
              <div className="lg:col-span-8 flex flex-col gap-3.5 w-full">
                {items.map((item) => (
                  <div key={item.id} className="border border-white/5 bg-background-card/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-primary-cyan/20 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full sm:max-w-[60%]">
                      <div className="w-14 h-14 border border-white/10 overflow-hidden bg-black/40 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[9px] text-text-dark uppercase">SKU: {item.sku}</span>
                        <h3 className="font-heading font-bold text-text-pure text-[12px] uppercase tracking-wide truncate">{item.name}</h3>
                        <span className="text-primary-cyan font-bold">{formatVND(item.price)}</span>
                      </div>
                    </div>

                    {/* BỘ ĐIỀU BIẾN SỐ LƯỢNG VÀ NÚT XOÁ QUYẾT TOÁN */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <div className="flex items-center border border-white/10 bg-black/20 p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 text-text-dark hover:text-text-pure transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 font-bold text-text-pure text-center min-w-[24px]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-text-dark hover:text-text-pure transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-text-pure min-w-[90px] text-right">{formatVND(item.price * item.quantity)}</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-text-dark hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Gỡ vật phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CỘT PHẢI: TỔNG KẾT TOÁN & BỘ ÁP VOUCHER ĐÁM MÂY (4 CỘT) */}
              <aside className="lg:col-span-4 flex flex-col gap-4 w-full sticky top-24">
                
                {/* BIỂU MẪU NHẬP MÃ VOUCHER PHÒNG LAB */}
                <div className="glass-premium p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-text-pure uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Tag className="w-3.5 h-3.5 text-primary-cyan" /> Giải mã xung mã ưu đãi
                  </span>
                  <form onSubmit={handleApplyVoucher} className="flex gap-2">
                    <input 
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="CYBERMUSH10"
                      disabled={isValidating}
                      className="w-full bg-background-dark border border-white/10 p-2 text-text-pure focus:border-primary-cyan outline-none uppercase font-bold text-xs"
                    />
                    <button 
                      type="submit"
                      disabled={isValidating || !voucherCode.trim()}
                      className="bg-white/5 border border-white/10 text-text-pure px-4 font-bold uppercase tracking-wider hover:bg-primary-cyan hover:text-background-deep hover:border-primary-cyan transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isValidating ? <Activity className="w-3.5 h-3.5 animate-spin" /> : "ÁP DỤNG"}
                    </button>
                  </form>

                  {/* THÔNG BÁO TRẠNG THÁI MÀNG LỌC VOUCHER */}
                  {voucherError && (
                    <span className="text-[10px] text-red-400 flex items-center gap-1 bg-red-500/5 p-2 border border-red-500/10"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {voucherError}</span>
                  )}
                  {voucherSuccess && (
                    <span className="text-[10px] text-primary-neon flex items-center gap-1 bg-primary-neon/5 p-2 border border-primary-neon/10"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> {voucherSuccess}</span>
                  )}
                </div>

                {/* BẢNG ĐỐI SOÁT TÀI CHÍNH TỔNG */}
                <div className="glass-premium p-5 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-text-pure uppercase border-b border-white/5 pb-2 block">Tổng bảng kê khai chi phí</span>
                  
                  <div className="flex flex-col gap-2 border-b border-white/5 pb-4 text-text-muted">
                    <div className="flex justify-between">
                      <span>Sinh khối gốc (Subtotal):</span>
                      <span className="text-text-pure font-bold">{formatVND(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-primary-neon font-bold">
                        <span>Khấu hao ưu đãi (Discount):</span>
                        <span>- {formatVND(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px]">
                      <span>Phí vận chuyển phòng Lab:</span>
                      <span className="italic text-text-dark uppercase">Tính ở bước sau</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center my-1">
                    <span className="text-text-pure uppercase font-bold text-[11px]">Tổng quyết toán thực tế:</span>
                    <span className="text-xl font-heading font-black text-primary-cyan tracking-tight">{formatVND(grandTotal)}</span>
                  </div>

                  {/* NÚT TIẾN VÀO TRẠM THANH TOÁN QUYẾT TOÁN */}
                  <Link 
                    href={{
                      pathname: "/checkout",
                      query: appliedVoucher ? { voucher: appliedVoucher.code } : {}
                    }}
                    className="h-11 bg-primary-neon text-background-deep font-heading font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-cyan transition-all cursor-pointer shadow-neon-cyan/10"
                  >
                    TIẾN TỚI QUYẾT TOÁN <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>

              </aside>

            </div>
          )}
        </Container>
      </div>
    </PageWrapper>
  );
}