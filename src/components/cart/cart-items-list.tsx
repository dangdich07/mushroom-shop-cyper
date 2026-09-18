"use client";

import { CartItemRow } from "./cart-item-row";
import type { CartItemsListProps } from "./cart.types";

export function CartItemsList({ items, onRemove, onUpdateQuantity }: CartItemsListProps) {
  return (
    <section className="min-w-0 space-y-3.5" aria-label={`Danh sách giỏ hàng, ${items.length} dòng sản phẩm`}>
      {items.map((item) => (
        <CartItemRow
          key={item.lineId}
          item={item}
          onDecrease={() => onUpdateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
          onIncrease={() => onUpdateQuantity(item.lineId, item.quantity + 1)}
          onRemove={() => onRemove(item.lineId)}
        />
      ))}
    </section>
  );
}
