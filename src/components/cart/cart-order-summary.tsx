import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CartOrderSummaryProps } from "./cart.types";

export function CartOrderSummary({ checkoutHref, discount, grandTotal, subtotal }: CartOrderSummaryProps) {
  return (
    <section className="glass-premium flex min-w-0 flex-col gap-4 p-5" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className="block border-b border-white/5 pb-2 text-[10px] font-bold uppercase text-text-pure">Tổng bảng kê khai chi phí</h2>
      <div className="flex min-w-0 flex-col gap-2 border-b border-white/5 pb-4 text-text-muted">
        <div className="flex min-w-0 flex-wrap justify-between gap-2">
          <span>Sinh khối gốc (Subtotal):</span>
          <span className="break-words font-bold text-text-pure">{formatVND(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex min-w-0 flex-wrap justify-between gap-2 font-bold text-primary-neon">
            <span>Khấu hao ưu đãi (Discount):</span>
            <span className="break-words">- {formatVND(discount)}</span>
          </div>
        )}
        <div className="flex min-w-0 flex-wrap justify-between gap-2 text-[10px]">
          <span>Phí vận chuyển phòng Lab:</span>
          <span className="italic uppercase text-text-dark">Tính ở bước sau</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-1">
        <span className="text-[11px] font-bold uppercase text-text-pure">Tổng quyết toán thực tế:</span>
        <strong className="break-words font-heading text-xl font-black tracking-tight text-primary-cyan">{formatVND(grandTotal)}</strong>
      </div>
      <Link href={checkoutHref} className="flex min-h-12 min-w-0 items-center justify-center gap-2 bg-primary-neon px-4 text-center font-heading text-xs font-black uppercase tracking-widest text-background-deep shadow-neon-cyan/10 hover:bg-primary-cyan focus-visible:bio-focus">
        <span className="break-words">TIẾN TỚI QUYẾT TOÁN</span> <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[2.5]" />
      </Link>
    </section>
  );
}
