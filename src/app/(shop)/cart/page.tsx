"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, CreditCard, Home, ShoppingCart } from "lucide-react";
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
        setVoucherError("Mã ưu đãi không hợp lệ hoặc hiện không hoạt động.");
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
        setVoucherError(`Đơn hàng chưa đạt giá trị tối thiểu ${formatVND(voucher.minSubtotal)} để áp dụng mã này.`);
        return;
      }

      // Luôn kiểm tra theo thời gian thực tế, không dùng mốc ngày hard-code.
      const expiryDateObj = new Date(`${voucher.expiryDate}T23:59:59`);
      const currentDateObj = new Date();

      if (expiryDateObj < currentDateObj) {
        setVoucherError("Mã ưu đãi này đã hết hạn.");
        return;
      }

      // ĐỦ ĐIỀU KIỆN ➔ THÔNG MẠCH VOUCHER
      applyVoucher(voucher);
      setVoucherSuccess(`Đã áp dụng mã ${voucher.code}${voucher.description ? `: ${voucher.description}` : "."}`);
    } catch (err) {
      setVoucherError("Không thể kết nối để kiểm tra mã. Vui lòng thử lại.");
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
  const appliedVoucherIneligibility = appliedVoucher && !appliedVoucherEligible
    ? new Date(`${appliedVoucher.expiryDate}T23:59:59`) < new Date()
      ? "Mã ưu đãi đang lưu đã hết hạn."
      : `Đơn hàng cần đạt tối thiểu ${formatVND(appliedVoucher.minSubtotal)} để mã có hiệu lực.`
    : null;

  const handleVoucherCodeChange = (value: string) => {
    setVoucherCode(value);
    if (voucherError) setVoucherError(null);
    if (voucherSuccess) setVoucherSuccess(null);
  };

  const handleRemoveVoucher = () => {
    removeVoucher();
    setVoucherCode("");
    setVoucherError(null);
    setVoucherSuccess(null);
  };

  return (
    <PageWrapper>
      <div className="home-bio-shell relative min-h-screen min-w-0 overflow-x-clip border-b border-primary-neon/10 py-4 sm:py-5 lg:py-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_10%,rgba(0,245,255,0.1),transparent_28%),radial-gradient(circle_at_82%_4%,rgba(139,92,246,0.08),transparent_24%)]" />
        <Container wide className="relative z-[1]">
          <nav aria-label="Điều hướng phân cấp" className="mb-2 flex min-h-9 items-center gap-2 text-xs text-text-dark sm:text-sm">
            <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-primary-neon focus-visible:bio-focus">
              <Home aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Link>
            <ChevronRight aria-hidden="true" className="h-4 w-4 text-primary-neon/60" />
            <span aria-current="page" className="text-text-muted">Giỏ hàng</span>
          </nav>

          <header className="mb-5 grid min-w-0 gap-4 border-b border-primary-neon/15 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.7fr)] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-neon">Khay tiếp nhận sản phẩm</p>
              <h1 className="mt-1.5 break-words font-heading text-[clamp(1.9rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.035em] text-text-pure">Giỏ hàng của bạn</h1>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-text-muted">Kiểm tra sản phẩm, biến thể và ưu đãi trước khi chuyển sang thanh toán.</p>
            </div>

            <ol aria-label="Tiến trình đặt hàng" className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: "Giỏ hàng", icon: ShoppingCart, active: true },
                { label: "Thanh toán", icon: CreditCard, active: false },
                { label: "Hoàn tất", icon: Check, active: false },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.label} className="relative flex min-w-0 flex-col items-center text-center">
                    {index > 0 ? <span aria-hidden="true" className="absolute right-1/2 top-[17px] -z-[1] h-px w-full bg-primary-neon/20" /> : null}
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full border bg-background-deep ${step.active ? "border-primary-neon text-primary-neon shadow-[0_0_18px_rgba(0,245,255,0.18)]" : "border-white/20 text-text-dark"}`}>
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className={`mt-1.5 truncate font-heading text-[11px] font-semibold ${step.active ? "text-primary-neon" : "text-text-dark"}`}>{step.label}</span>
                  </li>
                );
              })}
            </ol>
          </header>

          {items.length === 0 ? (
            <CartEmptyState actionHref="/products" />
          ) : (
            <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_23rem] xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-6">
              <div className="min-w-0">
                <CartItemsList items={items} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
              </div>

              <aside className="min-w-0 rounded-[12px] border border-primary-neon/25 bg-surface-glass p-4 shadow-[0_22px_64px_rgba(0,0,0,0.22),0_0_28px_rgba(0,245,255,0.05)] backdrop-blur-xl lg:sticky lg:top-24 lg:self-start">
                <h2 className="border-b border-primary-neon/12 pb-3 font-heading text-xl font-bold text-text-pure">Tóm tắt đơn hàng</h2>
                <CartVoucherPanel
                  appliedVoucher={appliedVoucher}
                  appliedVoucherIneligibility={appliedVoucherIneligibility}
                  isAppliedVoucherEligible={Boolean(appliedVoucherEligible)}
                  isValidating={isValidating}
                  voucherCode={voucherCode}
                  voucherError={voucherError}
                  voucherSuccess={voucherSuccess}
                  onCodeChange={handleVoucherCodeChange}
                  onRemoveVoucher={handleRemoveVoucher}
                  onSubmit={handleApplyVoucher}
                />
                <CartOrderSummary
                  subtotal={subtotal}
                  discount={discount}
                  grandTotal={grandTotal}
                  itemCount={items.reduce((count, item) => count + item.quantity, 0)}
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
