import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CartEmptyStateProps } from "./cart.types";

export function CartEmptyState({ actionHref }: CartEmptyStateProps) {
  return (
    <section className="flex w-full min-w-0 flex-col items-center border border-white/10 bg-surface-raised/45 px-4 py-12 text-center text-text-dark sm:px-6 sm:py-16" aria-labelledby="empty-cart-title" role="status">
      <span className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center border border-current/25 bg-current/[0.06]">
        <ShoppingBag aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 id="empty-cart-title" className="w-full min-w-0 break-words font-heading text-sm font-black uppercase tracking-[0.08em] text-text-pure">Khay trung chuyển đang trống rỗng</h2>
      <p className="mt-2 w-full min-w-0 break-words text-sm leading-relaxed text-text-dark">Chưa có vật phẩm nào trong giỏ hàng trung chuyển.</p>
      <Link href={actionHref} className="mt-5 inline-flex min-h-11 w-full min-w-0 items-center justify-center whitespace-normal break-words border border-primary-neon/30 px-3 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-primary-cyan hover:bg-primary-neon/10 hover:text-primary-neon focus-visible:bio-focus sm:w-auto sm:px-4">
        ➔ Quay lại sàn giao dịch nạp sinh khối
      </Link>
    </section>
  );
}
