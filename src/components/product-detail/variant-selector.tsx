"use client";

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
    <fieldset className="min-w-0 space-y-2">
      <legend className="text-[10px] uppercase text-text-dark">Chọn biến thể</legend>
      <div className="flex flex-wrap gap-2">
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
                "min-h-14 min-w-28 border px-3 py-2 text-left focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-45",
                selected ? "border-primary-neon bg-primary-neon/10 text-primary-neon" : "border-white/10 text-text-muted",
              )}
            >
              <b className="block break-words">{variant.name}</b>
              <span className="block text-[9px]">{variant.weightGrams ? `${variant.weightGrams}g · ` : ""}{formatVND(variant.price)}</span>
              <span className="mt-1 block text-[9px] uppercase">{available > 0 ? `Còn hàng: ${available}` : "Hết hàng"}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
