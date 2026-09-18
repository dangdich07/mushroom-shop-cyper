import { Calendar, Edit2, Percent, Trash2, WalletCards } from "lucide-react";
import type { AdminVoucher } from "@/features/admin/vouchers/admin-vouchers.types";
import { formatVND } from "@/lib/utils";

type DisplayStatus = "ACTIVE" | "EXPIRING" | "EXPIRED" | "INACTIVE";

const STATUS_LABEL: Record<DisplayStatus, string> = {
  ACTIVE: "Đang hoạt động",
  EXPIRING: "Sắp hết hạn",
  EXPIRED: "Đã hết hạn",
  INACTIVE: "Tạm khóa",
};

interface Props {
  voucher: AdminVoucher;
  status: DisplayStatus;
  pending: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export function AdminVoucherCard({ voucher, status, pending, onDelete, onEdit }: Props) {
  const statusClass = status === "ACTIVE" ? "border-primary-neon/30 text-primary-neon" : status === "EXPIRING" ? "border-amber-400/30 text-amber-400" : status === "EXPIRED" ? "border-red-400/30 text-red-400" : "border-white/15 text-text-muted";
  return (
    <article className="flex min-w-0 flex-col gap-3 border border-white/5 bg-background-card/15 p-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase text-text-dark">Mã voucher</p>
          <h2 className="mt-1 [overflow-wrap:anywhere] font-heading text-sm font-black uppercase tracking-wider text-primary-cyan">{voucher.code}</h2>
        </div>
        <span className={`border px-2 py-1 font-mono text-[8px] font-bold uppercase ${statusClass}`}>{STATUS_LABEL[status]}</span>
      </div>
      <p className="min-h-8 break-words text-[11px] leading-relaxed text-text-muted">{voucher.description || "Chưa có mô tả cho voucher này."}</p>
      <dl className="grid min-w-0 grid-cols-1 gap-2 border-y border-white/5 py-3 sm:grid-cols-2">
        <div><dt className="font-mono text-[8px] uppercase text-text-dark">Giá trị giảm</dt><dd className="mt-1 break-words font-mono text-xs font-bold text-text-pure">{voucher.discountType === "PERCENT" ? <span className="inline-flex items-center gap-1"><Percent aria-hidden="true" className="h-3 w-3" />{voucher.discountValue}%</span> : formatVND(voucher.discountValue)}</dd></div>
        <div><dt className="font-mono text-[8px] uppercase text-text-dark">Đơn tối thiểu</dt><dd className="mt-1 break-words font-mono text-xs font-bold text-text-pure">{formatVND(voucher.minSubtotal)}</dd></div>
      </dl>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase text-text-dark"><Calendar aria-hidden="true" className="h-3.5 w-3.5" />Hạn: {new Intl.DateTimeFormat("vi-VN").format(new Date(`${voucher.expiryDate}T00:00:00`))}</span>
        <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase text-text-dark"><WalletCards aria-hidden="true" className="h-3 w-3" />{voucher.discountType === "PERCENT" ? "Phần trăm" : "Giá trị cố định"}</span>
      </div>
      <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
        <button type="button" onClick={onEdit} disabled={pending} aria-label={`Sửa voucher ${voucher.code}`} className="inline-flex min-h-10 min-w-10 items-center justify-center border border-white/10 text-text-dark hover:border-primary-cyan hover:text-primary-cyan focus-visible:bio-focus disabled:opacity-40"><Edit2 aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" onClick={onDelete} disabled={pending} aria-label={`Xóa voucher ${voucher.code}`} className="inline-flex min-h-10 min-w-10 items-center justify-center border border-white/10 text-text-dark hover:border-red-400 hover:text-red-400 focus-visible:bio-focus disabled:opacity-40"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </article>
  );
}
