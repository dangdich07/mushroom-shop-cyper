import Link from "next/link";
import { CheckCircle2, ListOrdered, Route } from "lucide-react";

interface OrderSuccessPanelProps {
  orderId: string;
  status: string;
}

export function OrderSuccessPanel({ orderId, status }: OrderSuccessPanelProps) {
  return (
    <section className="mx-auto max-w-xl min-w-0 border border-primary-neon/20 bg-black/30 p-5 text-center sm:p-8" aria-labelledby="order-success-title">
      <CheckCircle2 aria-hidden="true" className="mx-auto h-9 w-9 text-primary-neon" />
      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary-neon">Đơn hàng đã được ghi nhận</p>
      <h1 id="order-success-title" className="mt-3 break-all font-heading text-xl font-black text-text-pure sm:text-2xl">{orderId}</h1>
      <p className="mt-3 break-words text-[10px] uppercase text-text-dark">Trạng thái đơn hàng: <strong className="text-text-pure">{status}</strong></p>
      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href={`/track-order?id=${encodeURIComponent(orderId)}`} className="flex min-h-11 items-center justify-center gap-2 border border-primary-cyan px-4 py-2 uppercase text-primary-cyan focus-visible:bio-focus"><Route aria-hidden="true" className="h-4 w-4" /> Theo dõi đơn</Link>
        <Link href="/account/orders" className="flex min-h-11 items-center justify-center gap-2 border border-white/10 px-4 py-2 uppercase text-text-pure focus-visible:bio-focus"><ListOrdered aria-hidden="true" className="h-4 w-4" /> Đơn của tôi</Link>
      </div>
    </section>
  );
}
