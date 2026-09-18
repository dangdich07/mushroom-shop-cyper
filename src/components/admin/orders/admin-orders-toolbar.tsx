import { RefreshCw, Search } from "lucide-react";

interface Props {
  count: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  search: string;
  status: string;
}

export function AdminOrdersToolbar({ count, isRefreshing, onRefresh, onSearchChange, onStatusChange, search, status }: Props) {
  return <section aria-label="Tìm kiếm và lọc đơn hàng" className="grid min-w-0 gap-4 border border-white/5 bg-black/20 p-4 md:grid-cols-12 md:items-end"><div className="min-w-0 md:col-span-5"><label htmlFor="admin-order-search" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-dark">Tìm đơn hàng</label><div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark" /><input id="admin-order-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Mã đơn hoặc tên người nhận" className="min-h-11 w-full min-w-0 border border-white/10 bg-background-dark py-2 pl-9 pr-3 font-mono text-xs uppercase text-text-pure outline-none focus-visible:bio-focus" /></div></div><div className="min-w-0 md:col-span-4"><label htmlFor="admin-order-status" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-dark">Trạng thái</label><select id="admin-order-status" value={status} onChange={(event) => onStatusChange(event.target.value)} className="min-h-11 w-full min-w-0 border border-white/10 bg-background-dark px-3 font-mono text-xs font-bold uppercase text-text-pure focus-visible:bio-focus"><option value="ALL">Toàn bộ trạng thái</option><option value="PENDING">PENDING — Đang chờ</option><option value="PROCESSING">PROCESSING — Đóng gói</option><option value="SHIPPED">SHIPPED — Đang vận chuyển</option><option value="DELIVERED">DELIVERED — Đã giao</option><option value="CANCELLED">CANCELLED — Đã hủy</option></select></div><div className="flex min-w-0 flex-wrap items-center justify-between gap-3 md:col-span-3 md:justify-end"><span className="font-mono text-[10px] font-bold uppercase text-text-dark">Kết quả: <strong className="text-primary-cyan">{count}</strong></span><button type="button" onClick={onRefresh} disabled={isRefreshing} className="inline-flex min-h-11 items-center gap-2 border border-white/10 bg-white/5 px-3 font-mono text-[10px] font-bold uppercase text-text-pure hover:border-primary-cyan focus-visible:bio-focus disabled:opacity-50"><RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin motion-reduce:animate-none" : ""}`} />Tải lại</button></div></section>;
}
