"use client";

import { Check, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVND } from "@/lib/utils";
import type { ProductVariant } from "@/types/product.types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <fieldset className="min-w-0 space-y-3 border-t border-primary-neon/10 pt-5">
      <legend className="pr-3 font-heading text-sm font-semibold text-text-pure">Chọn biến thể</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {variants.map((variant) => {
          const available = variant.stockQuantity - variant.reservedQuantity;
          const selected = selectedVariantId === variant.id;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={available <= 0}
              onClick={() => onSelect(variant.id)}
              aria-pressed={selected}
              className={cn(
                "relative min-h-[4.5rem] min-w-0 rounded-control border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none",
                selected
                  ? "border-primary-neon bg-primary-neon/10 text-primary-neon shadow-[0_0_18px_rgba(0,245,255,0.1)]"
                  : "border-white/10 bg-background-dark/30 text-text-muted hover:border-primary-neon/40",
              )}
            >
              <span className="flex min-w-0 items-start justify-between gap-2">
                <b className="block min-w-0 break-words text-sm leading-5">{variant.name}</b>
                {selected ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
              </span>
              <span className="mt-1 block font-mono text-[10px] text-text-dark">
                {variant.weightGrams ? `${variant.weightGrams}g · ` : ""}{formatVND(variant.price)}
              </span>
              <span className={`mt-1 flex items-center gap-1 text-[10px] ${available > 0 ? "text-status-success" : "text-status-danger"}`}>
                {available <= 0 ? <PackageX aria-hidden="true" className="h-3 w-3" /> : null}
                {available > 0 ? `Còn ${available}` : "Hết hàng"}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
