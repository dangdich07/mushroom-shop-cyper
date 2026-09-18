import { Plus, Search } from "lucide-react";
import type { VoucherStatusFilter } from "@/features/admin/vouchers/admin-vouchers.types";

interface Props {
  count: number;
  search: string;
  status: VoucherStatusFilter;
  onCreate: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: VoucherStatusFilter) => void;
}

export function AdminVouchersToolbar({ count, search, status, onCreate, onSearchChange, onStatusChange }: Props) {
  return (
    <section aria-label="Công cụ voucher" className="grid min-w-0 gap-3 border border-white/5 bg-black/20 p-3 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-end">
      <div className="min-w-0">
        <label htmlFor="voucher-search" className="mb-1 block font-mono text-[9px] font-bold uppercase text-text-dark">Tìm voucher</label>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark" />
          <input id="voucher-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Mã voucher hoặc mô tả" className="min-h-11 w-full min-w-0 border border-white/10 bg-background-dark py-2 pl-10 pr-3 font-mono text-xs uppercase text-text-pure placeholder:text-text-dark focus-visible:bio-focus" />
        </div>
      </div>
      <div>
        <label htmlFor="voucher-status" className="mb-1 block font-mono text-[9px] font-bold uppercase text-text-dark">Trạng thái</label>
        <select id="voucher-status" value={status} onChange={(event) => onStatusChange(event.target.value as VoucherStatusFilter)} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-mono text-[10px] font-bold uppercase text-text-pure focus-visible:bio-focus">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="EXPIRING">Sắp hết hạn (7 ngày)</option>
          <option value="EXPIRED">Đã hết hạn</option>
          <option value="INACTIVE">Tạm khóa</option>
        </select>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 lg:justify-end">
        <span className="font-mono text-[10px] uppercase text-text-dark">Hiển thị: <strong className="text-primary-cyan">{count}</strong></span>
        <button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary-neon px-4 font-mono text-[10px] font-bold uppercase text-background-deep hover:bg-primary-cyan focus-visible:bio-focus"><Plus aria-hidden="true" className="h-4 w-4" />Tạo voucher</button>
      </div>
    </section>
  );
}
