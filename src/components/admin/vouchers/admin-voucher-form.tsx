import type { FormEvent } from "react";
import { Save } from "lucide-react";
import type { AdminVoucherFormData } from "@/features/admin/vouchers/admin-vouchers.types";

interface Props {
  data: AdminVoucherFormData;
  editing: boolean;
  pending: boolean;
  onCancel: () => void;
  onChange: (data: AdminVoucherFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminVoucherForm({ data, editing, pending, onCancel, onChange, onSubmit }: Props) {
  const field = (patch: Partial<AdminVoucherFormData>) => onChange({ ...data, ...patch });
  return (
    <form onSubmit={onSubmit} className="grid max-h-[70vh] min-w-0 grid-cols-1 gap-4 overflow-y-auto pr-1 font-mono text-[10px] sm:grid-cols-2">
      <div className="sm:col-span-2"><label htmlFor="voucher-code" className="mb-1 block uppercase text-text-dark">Mã voucher</label><input id="voucher-code" required disabled={editing} minLength={2} maxLength={50} value={data.code} onChange={(event) => field({ code: event.target.value.toUpperCase() })} placeholder="CYBERMUSH10" className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-bold uppercase tracking-wider text-text-pure focus-visible:bio-focus disabled:opacity-50" /></div>
      <div><label htmlFor="voucher-type" className="mb-1 block uppercase text-text-dark">Hình thức giảm</label><select id="voucher-type" value={data.discountType} onChange={(event) => field({ discountType: event.target.value as AdminVoucherFormData["discountType"], discountValue: 0 })} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-bold uppercase text-text-pure focus-visible:bio-focus"><option value="PERCENT">Phần trăm (%)</option><option value="FIXED">Số tiền cố định (đ)</option></select></div>
      <div><label htmlFor="voucher-value" className="mb-1 block uppercase text-text-dark">Giá trị giảm</label><input id="voucher-value" required type="number" min={1} max={data.discountType === "PERCENT" ? 100 : undefined} step={1} value={data.discountValue} onChange={(event) => field({ discountValue: Number(event.target.value) })} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-bold text-primary-cyan focus-visible:bio-focus" /></div>
      <div><label htmlFor="voucher-minimum" className="mb-1 block uppercase text-text-dark">Đơn tối thiểu (VND)</label><input id="voucher-minimum" required type="number" min={0} step={1} value={data.minSubtotal} onChange={(event) => field({ minSubtotal: Number(event.target.value) })} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-bold text-text-pure focus-visible:bio-focus" /></div>
      <div><label htmlFor="voucher-expiry" className="mb-1 block uppercase text-text-dark">Ngày hết hạn</label><input id="voucher-expiry" required type="date" value={data.expiryDate} onChange={(event) => field({ expiryDate: event.target.value })} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-bold text-text-pure focus-visible:bio-focus" /></div>
      <div className="sm:col-span-2"><label htmlFor="voucher-description" className="mb-1 block uppercase text-text-dark">Mô tả ưu đãi</label><textarea id="voucher-description" required rows={3} maxLength={1000} value={data.description} onChange={(event) => field({ description: event.target.value })} className="w-full resize-y border border-white/10 bg-background-dark p-3 text-text-pure focus-visible:bio-focus" /></div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-white/5 pt-4 sm:col-span-2"><button type="button" onClick={onCancel} disabled={pending} className="min-h-11 border border-white/10 px-4 font-bold uppercase text-text-muted hover:text-text-pure focus-visible:bio-focus disabled:opacity-40">Hủy</button><button type="submit" disabled={pending} className="inline-flex min-h-11 items-center gap-2 bg-primary-cyan px-5 font-bold uppercase text-background-deep hover:bg-primary-neon focus-visible:bio-focus disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{pending ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo voucher"}</button></div>
    </form>
  );
}
