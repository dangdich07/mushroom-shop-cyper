import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { AdminDashboardOrder } from "@/features/admin/admin.types";
import { formatVND } from "@/lib/utils";
import { AdminStatePanel } from "./admin-state-panel";

function statusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING": return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "PROCESSING": return "border-primary-cyan/20 bg-primary-cyan/10 text-primary-cyan";
    case "SHIPPED":
    case "DELIVERED": return "border-primary-neon/20 bg-primary-neon/10 text-primary-neon";
    default: return "border-red-500/20 bg-red-500/10 text-red-400";
  }
}

export function AdminRecentOrders({ orders }: { orders: AdminDashboardOrder[] }) {
  return <section className="min-w-0 border border-white/5 bg-background-card/20 p-4 sm:p-6"><div className="mb-4 flex min-w-0 flex-col gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="flex min-w-0 items-center gap-2 break-words font-heading text-xs font-bold uppercase tracking-widest text-text-pure"><Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-cyan" />Xung tín hiệu vận đơn mới cập bến</h2><Link href="/admin/orders" className="inline-flex min-h-10 w-fit items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-dark hover:text-primary-neon focus-visible:bio-focus">Toàn bộ bản ghi <ArrowUpRight aria-hidden="true" className="h-3 w-3" /></Link></div>{orders.length === 0 ? <AdminStatePanel kind="EMPTY" message="Chưa có luồng dữ liệu giao dịch phát sinh." /> : <ul className="grid min-w-0 gap-2">{orders.map((order) => <li key={order.id} className="grid min-w-0 gap-3 border border-white/5 bg-black/10 p-3 font-mono text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><p className="break-all font-bold uppercase tracking-wide text-text-pure">{order.id}</p><p className="mt-1 break-words text-[10px] uppercase text-text-muted">{order.shippingName}</p></div><div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end"><strong className="break-words text-primary-cyan">{formatVND(order.grandTotal)}</strong><span className={`border px-2 py-0.5 text-[9px] font-bold uppercase ${statusClasses(order.status)}`}>{order.status}</span></div></li>)}</ul>}</section>;
}

