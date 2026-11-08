"use client";

import { PackageCheck } from "lucide-react";
import { CartItemRow } from "./cart-item-row";
import type { CartItemsListProps } from "./cart.types";

export function CartItemsList({ items, onRemove, onUpdateQuantity }: CartItemsListProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[12px] border border-primary-neon/20 bg-surface-glass shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-xl" aria-labelledby="cart-items-title">
      <header className="flex min-h-13 items-center justify-between gap-4 border-b border-primary-neon/15 px-4">
        <h2 id="cart-items-title" className="flex items-center gap-3 font-heading text-base font-bold text-text-pure">
          <span className="flex h-8 w-8 items-center justify-center rounded-control border border-primary-neon/25 bg-primary-neon/[0.06] text-primary-neon">
            <PackageCheck aria-hidden="true" className="h-4 w-4" />
          </span>
          Sản phẩm
        </h2>
        <span className="font-mono text-[10px] text-text-dark">{items.length} dòng sản phẩm</span>
      </header>

      <div aria-hidden="true" className="hidden min-h-10 grid-cols-[minmax(0,1fr)_6.5rem_8.5rem_7.5rem_2.75rem] items-center gap-3 border-b border-primary-neon/10 bg-background-dark/30 px-4 font-mono text-[8px] uppercase tracking-[0.13em] text-text-dark md:grid">
        <span>Sản phẩm</span>
        <span className="text-right">Đơn giá</span>
        <span className="text-center">Số lượng</span>
        <span className="text-right">Thành tiền</span>
        <span />
      </div>

      <div className="divide-y divide-primary-neon/10">
        {items.map((item) => (
          <CartItemRow
            key={item.lineId}
            item={item}
            onDecrease={() => onUpdateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
            onIncrease={() => onUpdateQuantity(item.lineId, item.quantity + 1)}
            onRemove={() => onRemove(item.lineId)}
          />
        ))}
      </div>
    </section>
  );
}
