"use client";

import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityActionsProps {
  availableQuantity: number;
  isFavorite: boolean;
  quantity: number;
  onAddToCart: () => void;
  onChangeQuantity: (quantity: number) => void;
  onToggleFavorite: () => void;
}

export function QuantityActions({ availableQuantity, isFavorite, quantity, onAddToCart, onChangeQuantity, onToggleFavorite }: QuantityActionsProps) {
  if (availableQuantity <= 0) return null;

  return (
    <div className="mt-2 flex min-w-0 flex-wrap items-end gap-3">
      <div className="w-full text-[10px] uppercase text-text-dark">
        Khả dụng: <b className="text-primary-neon">{availableQuantity}</b> sản phẩm
      </div>
      <div className="flex h-12 items-stretch border border-white/10 bg-black/20" role="group" aria-label="Chọn số lượng">
        <button type="button" onClick={() => onChangeQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Giảm số lượng" className="flex min-w-12 items-center justify-center text-text-dark hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <input
          type="number"
          min={1}
          max={availableQuantity}
          value={quantity}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChangeQuantity(Math.max(1, Math.min(availableQuantity, Math.trunc(next))));
          }}
          aria-label="Số lượng sản phẩm"
          className="w-14 border-x border-white/10 bg-transparent text-center text-sm font-bold text-text-pure outline-none focus-visible:bio-focus"
        />
        <button type="button" disabled={quantity >= availableQuantity} onClick={() => onChangeQuantity(Math.min(availableQuantity, quantity + 1))} aria-label="Tăng số lượng" title={quantity >= availableQuantity ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"} className="flex min-w-12 items-center justify-center text-text-dark hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={onAddToCart} className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 bg-primary-neon px-5 font-black uppercase tracking-widest text-background-deep shadow-lg shadow-neon-cyan/20 hover:bg-primary-cyan focus-visible:bio-focus sm:flex-none">
        <ShoppingCart aria-hidden="true" className="h-4 w-4 shrink-0" /> <span className="break-words">Bơm sinh khối vào giỏ</span>
      </button>
      <button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"} aria-pressed={isFavorite} className={cn("flex h-12 w-12 shrink-0 items-center justify-center border focus-visible:bio-focus", isFavorite ? "border-red-500 bg-red-500/10 text-red-500" : "border-white/10 text-text-dark hover:border-white/20 hover:text-text-pure")}>
        <Heart aria-hidden="true" className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>
    </div>
  );
}
