"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { CartEmptyState } from "@/components/cart/cart-empty-state";
import { CartItemsList } from "@/components/cart/cart-items-list";
import { CartOrderSummary } from "@/components/cart/cart-order-summary";
import { CartVoucherPanel } from "@/components/cart/cart-voucher-panel";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { formatVND } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/useCartStore";

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
export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
  } = useCartStore();

  // TRẠNG THÁI XỬ LÝ MÃ GIẢM GIÁ
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // TÍNH TOÁN CƠ SỞ ĐƠN HÀNG
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // HÀM KIỂM TOÁN VOUCHER ĐẦU CUỐI
  const handleApplyVoucher = async (e: FormEvent) => {
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
        return;
      }

      const row = data as unknown as DbVoucherSchema;
      const voucher: VerifiedVoucher = {
        code: row.code,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        minSubtotal: Number(row.min_subtotal),
        description: row.description || "",
        expiryDate: row.expiry_date,
      };

      // MÀNG LỌC 1: KIỂM TRA NGƯỠNG SÀN SUBTOTAL
      if (subtotal < voucher.minSubtotal) {
        setVoucherError(`Mã này chỉ kích hoạt cho đơn hàng có sinh khối từ ${formatVND(voucher.minSubtotal)} trở lên.`);
        return;
      }

      // Luôn kiểm tra theo thời gian thực tế, không dùng mốc ngày hard-code.
      const expiryDateObj = new Date(`${voucher.expiryDate}T23:59:59`);
      const currentDateObj = new Date();

      if (expiryDateObj < currentDateObj) {
        setVoucherError("Phễu ưu đãi này đã quá hạn và bị đóng băng vĩnh viễn.");
        return;
      }

      // ĐỦ ĐIỀU KIỆN ➔ THÔNG MẠCH VOUCHER
      applyVoucher(voucher);
      setVoucherSuccess(`Kích hoạt thành công mã [${voucher.code}]: ${voucher.description}`);
    } catch (err) {
      setVoucherError("Lỗi hệ thống trong luồng đối soát cơ sở dữ liệu.");
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  // TÍNH TOÁN KHẤU HAO TÀI CHÍNH
  const appliedVoucherEligible =
    appliedVoucher &&
    subtotal >= appliedVoucher.minSubtotal &&
    new Date(`${appliedVoucher.expiryDate}T23:59:59`) >= new Date();

  let discount = 0;
  if (appliedVoucherEligible) {
    if (appliedVoucher.discountType === "PERCENT") {
      discount = (subtotal * appliedVoucher.discountValue) / 100;
    } else {
      discount = appliedVoucher.discountValue;
    }
  }
  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <PageWrapper>
      <div className="relative min-h-screen min-w-0 overflow-x-clip border-b border-white/5 py-8 font-mono text-xs sm:py-12">
        <Container>
          <header className="mb-8 flex min-w-0 flex-col gap-2 border-b border-white/5 pb-6">
            <span className="text-[10px] uppercase tracking-widest text-primary-neon">Khay Nghiệm Thu Vật Phẩm</span>
            <h1 className="break-words font-heading text-3xl font-black uppercase tracking-tight text-text-pure sm:text-4xl">Giỏ Hàng Trung Chuyển</h1>
            {items.length > 0 && <p className="text-[10px] uppercase tracking-wider text-text-dark">Đang lưu trữ {items.length} dòng vật phẩm trong khay tiếp nhận</p>}
          </header>

          {items.length === 0 ? (
            <CartEmptyState actionHref="/products" />
          ) : (
            <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                <CartItemsList items={items} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
              </div>

              <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4">
                <CartVoucherPanel
                  appliedVoucher={appliedVoucher}
                  isAppliedVoucherEligible={Boolean(appliedVoucherEligible)}
                  isValidating={isValidating}
                  voucherCode={voucherCode}
                  voucherError={voucherError}
                  voucherSuccess={voucherSuccess}
                  onCodeChange={setVoucherCode}
                  onRemoveVoucher={removeVoucher}
                  onSubmit={handleApplyVoucher}
                />
                <CartOrderSummary
                  subtotal={subtotal}
                  discount={discount}
                  grandTotal={grandTotal}
                  checkoutHref={{
                    pathname: "/checkout",
                    query: appliedVoucherEligible ? { voucher: appliedVoucher.code } : {},
                  }}
                />
              </aside>
            </div>
          )}
        </Container>
      </div>
    </PageWrapper>
  );
}
