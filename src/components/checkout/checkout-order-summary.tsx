import { PackageCheck, ReceiptText, Tag, Truck } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CheckoutOrderSummaryProps } from "./checkout.types";

export function CheckoutOrderSummary({ estimatedBeforeDiscount, itemCount, shippingFee, subtotal, totalQuantity, voucherCode }: CheckoutOrderSummaryProps) {
  return (
    <section className="glass-premium flex min-w-0 flex-col gap-4 p-4 sm:p-5" aria-labelledby="checkout-summary-title">
      <h2 id="checkout-summary-title" className="flex items-center gap-2 border-b border-white/5 pb-3 text-[10px] font-bold uppercase text-text-pure">
        <ReceiptText aria-hidden="true" className="h-4 w-4 text-primary-cyan" /> Báo cáo tóm tắt vận đơn
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <Metric label="Dòng hàng" value={String(itemCount)} />
        <Metric label="Tổng số lượng" value={String(totalQuantity)} />
      </div>

      <dl className="min-w-0 space-y-3 border-y border-white/5 py-4 text-text-muted">
        <SummaryRow icon={<PackageCheck aria-hidden="true" className="h-4 w-4" />} label="Tổng khối lượng nấm:" value={formatVND(subtotal)} />
        <SummaryRow icon={<Truck aria-hidden="true" className="h-4 w-4" />} label="Phí vận chuyển phòng bọc:" value={shippingFee === 0 ? "MIỄN PHÍ" : formatVND(shippingFee)} />
        {voucherCode && (
          <div className="min-w-0 border border-primary-neon/15 bg-primary-neon/[0.05] p-3 text-primary-neon">
            <dt className="flex items-center gap-2 text-[9px] font-bold uppercase"><Tag aria-hidden="true" className="h-3.5 w-3.5" /> Mã ưu đãi đã khóa</dt>
            <dd className="mt-1 break-all font-bold uppercase">{voucherCode}</dd>
            <p className="mt-1 text-[9px] font-normal text-text-dark">Chờ đối soát khi tạo đơn.</p>
          </div>
        )}
      </dl>

      <div className="min-w-0 border border-primary-cyan/25 bg-primary-cyan/[0.06] p-4">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-text-dark">Tạm tính trước ưu đãi</span>
        <strong className="mt-1 block break-words font-heading text-2xl font-black text-primary-cyan">{formatVND(estimatedBeforeDiscount)}</strong>
        <span className="mt-2 block text-[9px] leading-relaxed text-text-dark">Đây chưa phải số tiền thanh toán cuối cùng. Voucher sẽ được đối soát khi tạo đơn.</span>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border border-white/5 bg-transparent p-3"><span className="block text-[8px] uppercase text-text-dark">{label}</span><strong className="mt-1 block break-words text-sm text-text-pure">{value}</strong></div>;
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 items-start justify-between gap-3"><dt className="flex min-w-0 items-start gap-2"><span className="mt-0.5 shrink-0 text-text-dark">{icon}</span><span className="break-words">{label}</span></dt><dd className="shrink-0 break-words text-right font-bold text-text-pure">{value}</dd></div>;
}
