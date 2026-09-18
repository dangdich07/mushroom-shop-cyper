"use client";

import { useState } from "react";
import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CartItemRowProps } from "./cart.types";

export function CartItemRow({ item, onDecrease, onIncrease, onRemove }: CartItemRowProps) {
  const [imageFailed, setImageFailed] = useState(!item.image?.trim());

  return (
    <article className="group grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border border-white/5 bg-background-card/20 p-3 hover:border-primary-cyan/20 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4">
      <div className="aspect-square w-[4.5rem] shrink-0 overflow-hidden border border-white/10 bg-black/40">
        {imageFailed ? (
          <div role="img" aria-label={`Không có ảnh cho ${item.name}`} className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-dark">
            <ImageOff aria-hidden="true" className="h-5 w-5" />
            <span className="text-[7px] uppercase">Đang cập nhật</span>
          </div>
        ) : (
          <img src={item.image} alt={item.name} onError={() => setImageFailed(true)} className="h-full w-full object-cover opacity-80" />
        )}
      </div>

      <div className="min-w-0 space-y-1">
        <span className="block break-all text-[9px] uppercase text-text-dark">SKU: {item.sku}</span>
        <h2 className="break-words font-heading text-xs font-bold uppercase leading-snug tracking-wide text-text-pure">{item.name}</h2>
        <span className="block break-words text-[9px] uppercase text-primary-neon">{item.variantName}</span>
        <span className="block font-bold text-primary-cyan">{formatVND(item.price)}</span>
      </div>

      <div className="col-span-2 grid min-w-0 grid-cols-[auto_minmax(5.5rem,1fr)_3rem] items-center gap-3 border-t border-white/5 pt-3 sm:col-span-1 sm:flex sm:border-0 sm:pt-0">
        <div className="flex h-11 items-stretch border border-white/10 bg-black/20" role="group" aria-label={`Số lượng ${item.name}`}>
          <button type="button" onClick={onDecrease} disabled={item.quantity <= 1} aria-label={`Giảm số lượng ${item.name}`} className="flex min-w-11 items-center justify-center text-text-dark hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
            <Minus aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <output aria-label={`Số lượng hiện tại: ${item.quantity}`} className="flex min-w-10 items-center justify-center border-x border-white/10 px-2 text-center font-bold text-text-pure">{item.quantity}</output>
          <button type="button" onClick={onIncrease} aria-label={`Tăng số lượng ${item.name}`} className="flex min-w-11 items-center justify-center text-text-dark hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus">
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="min-w-0 break-words text-right font-bold text-text-pure sm:min-w-[6rem]">{formatVND(item.price * item.quantity)}</span>
        <button type="button" onClick={onRemove} aria-label={`Gỡ ${item.name} khỏi giỏ hàng`} title="Gỡ vật phẩm" className="flex h-11 w-11 items-center justify-center text-text-dark hover:bg-red-500/5 hover:text-red-400 focus-visible:bio-focus">
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
