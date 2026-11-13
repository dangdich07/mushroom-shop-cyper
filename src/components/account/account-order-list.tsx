import Link from "next/link";
import { formatVND } from "@/lib/utils";

export interface AccountOrderListItem {
  amount: number;
  id: string;
  productName: string;
  status: string;
  timeStamp: string;
  trackingHref: string;
}

interface AccountOrderListProps {
  orders: AccountOrderListItem[];
}

function statusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING": return "border-primary-cyan/20 bg-primary-cyan/10 text-primary-cyan";
    case "COMPLETED":
    case "SUCCESS": return "border-primary-neon/20 bg-primary-neon/10 text-primary-neon";
    case "CANCELLED":
    case "FAILED": return "border-red-500/20 bg-red-500/10 text-red-500";
    default: return "border-white/10 bg-white/5 text-text-muted";
  }
}

export function AccountOrderList({ orders }: AccountOrderListProps) {
  return (
    <div className="min-w-0 divide-y divide-white/5 border-y border-white/5" aria-label="Danh sách đơn hàng">
      {orders.map((order) => (
        <article key={order.id} className="group min-w-0 bg-black/[0.06] px-3 py-4 hover:bg-white/[0.02] sm:px-4">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="min-w-0 break-words font-semibold text-text-pure sm:text-sm">{order.productName}</h2>
                <span className={`inline-flex shrink-0 border px-2 py-0.5 text-[8px] font-bold uppercase ${statusClasses(order.status)}`}>{order.status}</span>
              </div>
              <p className="mt-1 break-all font-mono text-[9px] uppercase tracking-wide text-primary-cyan/80">Mã đơn: {order.id}</p>
              <p className="mt-1.5 break-words text-[9px] text-text-dark">{order.timeStamp}</p>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-4 border-t border-white/5 pt-3 md:w-auto md:shrink-0 md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <div className="min-w-0 md:text-right">
                <span className="block text-[8px] uppercase tracking-wider text-text-dark">Tổng tiền</span>
                <strong className="mt-0.5 block break-words font-mono text-xs text-primary-cyan">{formatVND(order.amount)}</strong>
              </div>
              <Link href={order.trackingHref} aria-label={`Đối soát đơn hàng ${order.id}`} className="flex min-h-10 shrink-0 items-center justify-center border border-primary-neon/25 px-3 py-2 text-center text-[9px] font-bold uppercase text-primary-neon hover:border-primary-cyan hover:text-primary-cyan focus-visible:bio-focus">Đối soát</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
