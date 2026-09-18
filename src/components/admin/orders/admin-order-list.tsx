import type { AdminOrderData } from "@/features/admin/orders/admin-orders.types";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";

function statusClasses(status: string) {
  if (status === "PENDING") return "border-amber-500/20 bg-amber-500/5 text-amber-400";
  if (status === "PROCESSING") return "border-primary-cyan/20 bg-primary-cyan/5 text-primary-cyan";
  if (status === "SHIPPED") return "border-purple-500/20 bg-purple-500/5 text-purple-400";
  if (status === "DELIVERED") return "border-primary-neon/20 bg-primary-neon/5 text-primary-neon";
  return "border-red-500/20 bg-red-500/5 text-red-400";
}

export function AdminOrderList({ orders, selectedId, onSelect }: { orders: AdminOrderData[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return <div className="grid min-w-0 gap-2 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1"><h2 className="sr-only">Danh sách đơn hàng</h2>{orders.map((order) => { const selected = selectedId === order.id; return <button key={order.id} type="button" aria-pressed={selected} onClick={() => onSelect(order.id)} className={cn("grid min-h-20 min-w-0 gap-2 border p-3.5 text-left transition-colors focus-visible:bio-focus motion-reduce:transition-none", selected ? "border-primary-cyan bg-primary-cyan/5" : "border-white/5 bg-background-card/10 hover:border-white/15")}><span className="flex min-w-0 flex-wrap items-center justify-between gap-2"><strong className="min-w-0 break-all font-mono text-xs uppercase tracking-wide text-text-pure">{order.id}</strong><span className={cn("shrink-0 border px-2 py-0.5 font-mono text-[9px] font-black uppercase", statusClasses(order.status))}>{order.status}</span></span><span className="flex min-w-0 flex-wrap items-center justify-between gap-2 font-mono text-[11px]"><span className="min-w-0 break-words uppercase text-text-muted">{order.shipping_name}</span><strong className="shrink-0 text-primary-cyan">{formatVND(order.grand_total)}</strong></span></button>; })}</div>;
}
