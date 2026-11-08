import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CartOrderSummaryProps } from "./cart.types";

export function CartOrderSummary({ checkoutHref, discount, grandTotal, itemCount, subtotal }: CartOrderSummaryProps) {
  return (
    <section className="mt-4 flex min-w-0 flex-col gap-4" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className="sr-only">Tổng thanh toán</h2>

      <dl className="flex min-w-0 flex-col gap-2.5 border-b border-primary-neon/10 pb-4 text-sm text-text-muted">
        <div className="flex min-w-0 justify-between gap-4">
          <dt>Tạm tính <span className="text-text-dark">({itemCount} sản phẩm)</span></dt>
          <dd className="break-words text-right font-mono font-bold text-text-pure">{formatVND(subtotal)}</dd>
        </div>
        <div className={`flex min-w-0 justify-between gap-4 ${discount > 0 ? "text-status-success" : "text-text-muted"}`}>
          <dt>Giảm giá</dt>
          <dd className="break-words text-right font-mono font-bold">{discount > 0 ? `- ${formatVND(discount)}` : formatVND(0)}</dd>
        </div>
        <div className="flex min-w-0 justify-between gap-4">
          <dt>Phí vận chuyển</dt>
          <dd className="text-right text-xs italic text-text-dark">Tính tại Checkout</dd>
        </div>
      </dl>

      <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <span className="font-heading text-base font-bold text-text-pure">Tổng thanh toán</span>
        <strong className="break-words text-right font-heading text-2xl font-bold tracking-tight text-primary-neon">{formatVND(grandTotal)}</strong>
      </div>

      <Link href={checkoutHref} className="flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-control bg-primary-neon px-4 text-center font-heading text-sm font-bold text-background-deep shadow-[0_0_28px_rgba(0,245,255,0.22)] transition-[background-color,box-shadow,transform] hover:bg-primary-cyan hover:shadow-[0_0_36px_rgba(0,245,255,0.3)] focus-visible:bio-focus motion-safe:active:scale-[0.99] motion-reduce:transition-none">
        <LockKeyhole aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="break-words">Tiến hành thanh toán</span>
        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[2.5]" />
      </Link>

      <Link href="/products" className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-control border border-primary-neon/35 px-4 text-center font-heading text-xs font-semibold text-text-muted transition-colors hover:border-primary-neon hover:text-primary-neon focus-visible:bio-focus">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Tiếp tục mua sắm
      </Link>

      <div className="flex items-start gap-2.5 border-t border-primary-neon/10 pt-3">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary-neon" />
        <div>
          <p className="font-heading text-xs font-semibold text-text-pure">Xác nhận ở bước tiếp theo</p>
          <p className="mt-0.5 text-[11px] leading-4 text-text-dark">Phí vận chuyển và thông tin nhận hàng được xử lý tại Checkout.</p>
        </div>
      </div>
    </section>
  );
}
