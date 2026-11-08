"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CartItemRowProps } from "./cart.types";

export function CartItemRow({ item, onDecrease, onIncrease, onRemove }: CartItemRowProps) {
  const [imageFailed, setImageFailed] = useState(!item.image?.trim());

  useEffect(() => {
    setImageFailed(!item.image?.trim());
  }, [item.image]);

  return (
    <article className="group grid min-w-0 gap-3 bg-background-card/20 p-3 transition-colors hover:bg-primary-neon/[0.025] md:grid-cols-[minmax(0,1fr)_6.5rem_8.5rem_7.5rem_2.75rem] md:items-center md:px-4 md:py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border border-primary-neon/15 bg-background-dark">
          {imageFailed ? (
            <div role="img" aria-label={`Chưa có ảnh cho ${item.name}`} className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_38%,rgba(0,245,255,0.13),transparent_28%),linear-gradient(145deg,var(--color-surface-overlay),var(--color-background-dark))] px-2 text-center text-primary-neon/70">
              <ImageOff aria-hidden="true" className="h-5 w-5" />
              <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-text-dark">Ảnh đang cập nhật</span>
            </div>
          ) : (
            <Image src={item.image} alt={item.name} fill unoptimized sizes="80px" onError={() => setImageFailed(true)} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 motion-reduce:transition-none" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="break-words font-heading text-[13px] font-bold leading-snug text-text-pure sm:text-sm">{item.name}</h3>
          <p className="mt-0.5 break-all font-mono text-[8px] uppercase tracking-[0.1em] text-text-dark">SKU: {item.sku || "Chưa cập nhật"}</p>
          <StatusBadge tone="cyan" className="mt-1.5 min-h-5 max-w-full px-1.5 py-0 normal-case tracking-normal"><span className="truncate">{item.variantName}</span></StatusBadge>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 md:block md:text-right">
        <span className="font-heading text-xs font-medium text-text-dark md:hidden">Đơn giá</span>
        <span className="break-words font-mono text-sm font-bold text-text-pure">{formatVND(item.price)}</span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 md:justify-center">
        <span className="font-heading text-xs font-medium text-text-dark md:hidden">Số lượng</span>
        <div className="flex h-10 items-stretch overflow-hidden rounded-control border border-white/10 bg-background-dark/55" role="group" aria-label={`Số lượng ${item.name}`}>
          <button type="button" onClick={onDecrease} disabled={item.quantity <= 1} aria-label={`Giảm số lượng ${item.name}`} className="flex min-w-10 items-center justify-center text-text-dark transition-colors hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
            <Minus aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <output aria-label={`Số lượng hiện tại: ${item.quantity}`} className="flex min-w-9 items-center justify-center border-x border-white/10 px-1.5 text-center font-bold text-text-pure">{item.quantity}</output>
          <button type="button" onClick={onIncrease} disabled={item.quantity >= 99} aria-label={`Tăng số lượng ${item.name}`} title={item.quantity >= 99 ? "Đã đạt giới hạn số lượng" : "Tăng số lượng"} className="flex min-w-10 items-center justify-center text-text-dark transition-colors hover:bg-white/5 hover:text-text-pure focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30">
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 md:block md:text-right">
        <span className="font-heading text-xs font-medium text-text-dark md:hidden">Thành tiền</span>
        <strong className="min-w-0 break-words font-heading text-sm font-bold text-primary-neon">{formatVND(item.price * item.quantity)}</strong>
      </div>

      <button type="button" onClick={onRemove} aria-label={`Xóa ${item.name} khỏi giỏ hàng`} title="Xóa sản phẩm" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-status-danger/20 bg-status-danger/[0.04] px-3 text-status-danger transition-colors hover:border-status-danger/45 hover:bg-status-danger/10 focus-visible:bio-focus md:h-10 md:min-h-10 md:w-10 md:px-0">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        <span className="font-heading text-xs font-semibold md:sr-only">Xóa sản phẩm</span>
      </button>
    </article>
  );
}
