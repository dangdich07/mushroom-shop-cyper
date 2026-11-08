import { PackageCheck, ReceiptText, Tag, Truck } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CheckoutOrderSummaryProps } from "./checkout.types";

export function CheckoutOrderSummary({ estimatedBeforeDiscount, itemCount, shippingFee, subtotal, totalQuantity, voucherCode }: CheckoutOrderSummaryProps) {
  return (
    <section className="glass-premium flex min-w-0 flex-col gap-3" aria-labelledby="checkout-summary-title">
      <h2 id="checkout-summary-title" className="sr-only">
        <ReceiptText aria-hidden="true" /> Tóm tắt đơn hàng
      </h2>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Metric label="Dòng hàng" value={String(itemCount)} />
        <Metric label="Tổng số lượng" value={String(totalQuantity)} />
      </div>

      <dl className="min-w-0 space-y-2 border-b border-primary-cyan/15 pb-3 text-text-muted">
        <SummaryRow icon={<PackageCheck aria-hidden="true" className="h-4 w-4" />} label="Tạm tính" value={formatVND(subtotal)} />
        <SummaryRow icon={<Truck aria-hidden="true" className="h-4 w-4" />} label="Phí vận chuyển" value={shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)} />
        {voucherCode && (
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-primary-neon/15 bg-primary-neon/[0.05] px-3 py-2 text-primary-neon">
            <dt className="flex items-center gap-2 text-xs"><Tag aria-hidden="true" className="h-3.5 w-3.5" /> Mã ưu đãi</dt>
            <dd className="break-all text-xs font-bold">{voucherCode}</dd>
          </div>
        )}
      </dl>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-text-pure">Tổng trước ưu đãi</span>
          <strong className="break-words font-heading text-[24px] font-bold text-primary-cyan">{formatVND(estimatedBeforeDiscount)}</strong>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-text-dark">Số tiền cuối cùng và voucher được xác nhận khi tạo đơn.</p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-dark"><span>{label}:</span><strong className="text-text-pure">{value}</strong></div>;
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 items-start justify-between gap-3"><dt className="flex min-w-0 items-start gap-2"><span className="mt-0.5 shrink-0 text-text-dark">{icon}</span><span className="break-words">{label}</span></dt><dd className="shrink-0 break-words text-right font-bold text-text-pure">{value}</dd></div>;
}
