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
  const canPurchase = availableQuantity > 0;

  return (
    <div className="mt-auto border-t border-primary-neon/10 pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-heading text-sm font-semibold text-text-pure">Số lượng</span>
        <span className="font-mono text-[10px] text-text-dark">
          Khả dụng: <b className={canPurchase ? "text-status-success" : "text-status-danger"}>{Math.max(availableQuantity, 0)}</b>
        </span>
      </div>
      <div className="grid min-w-0 grid-cols-[auto_1fr] gap-3 sm:grid-cols-[auto_minmax(0,1fr)_3.5rem]">
        <div className="flex h-14 items-stretch overflow-hidden rounded-control border border-white/10 bg-background-dark/45" role="group" aria-label="Chọn số lượng">
          <button type="button" onClick={() => onChangeQuantity(Math.max(1, quantity - 1))} disabled={!canPurchase || quantity <= 1} aria-label="Giảm số lượng" className="flex min-w-11 items-center justify-center text-text-dark transition-colors hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
            <Minus aria-hidden="true" className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={Math.max(1, availableQuantity)}
            value={quantity}
            disabled={!canPurchase}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChangeQuantity(Math.max(1, Math.min(availableQuantity, Math.trunc(next))));
            }}
            aria-label="Số lượng sản phẩm"
            className="w-12 border-x border-white/10 bg-transparent text-center text-sm font-bold text-text-pure outline-none focus-visible:bio-focus disabled:opacity-40"
          />
          <button type="button" disabled={!canPurchase || quantity >= availableQuantity} onClick={() => onChangeQuantity(Math.min(availableQuantity, quantity + 1))} aria-label="Tăng số lượng" title={quantity >= availableQuantity ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"} className="flex min-w-11 items-center justify-center text-text-dark transition-colors hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
            <Plus aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={onAddToCart} disabled={!canPurchase} className="flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-control bg-primary-neon px-4 font-heading text-sm font-bold text-background-deep shadow-[0_0_26px_rgba(0,245,255,0.22)] transition-[background-color,box-shadow,transform] hover:bg-primary-cyan hover:shadow-[0_0_34px_rgba(0,245,255,0.32)] focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-45 motion-safe:active:scale-[0.99] motion-reduce:transition-none">
          <ShoppingCart aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span className="break-words">{canPurchase ? "Thêm vào giỏ" : "Tạm hết hàng"}</span>
        </button>
        <button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"} aria-pressed={isFavorite} className={cn("col-span-2 flex h-14 w-full shrink-0 items-center justify-center rounded-control border transition-colors focus-visible:bio-focus sm:col-span-1 sm:w-14", isFavorite ? "border-status-danger/45 bg-status-danger/10 text-status-danger" : "border-primary-neon/25 bg-primary-neon/[0.04] text-text-muted hover:border-primary-neon hover:text-primary-neon")}>
          <Heart aria-hidden="true" className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
