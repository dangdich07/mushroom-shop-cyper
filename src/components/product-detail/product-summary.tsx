"use client";

import { Star } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { ProductDetailData } from "./product-detail.types";
import { QuantityActions } from "./quantity-actions";
import { VariantSelector } from "./variant-selector";

interface ProductSummaryProps {
  product: ProductDetailData;
  selectedVariantId: string;
  quantity: number;
  availableQuantity: number;
  isFavorite: boolean;
  onSelectVariant: (id: string) => void;
  onChangeQuantity: (quantity: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}

export function ProductSummary(props: ProductSummaryProps) {
  const { product } = props;
  const selectedVariant = product.variants.find((variant) => variant.id === props.selectedVariantId);
  return (
    <section className="flex min-w-0 flex-col gap-5" aria-labelledby="product-title">
      <div className="min-w-0 space-y-1">
        <span className="block break-all text-[10px] uppercase tracking-widest text-primary-cyan">MÃ ĐỊNH DANH SKU: {product.sku}</span>
        <h1 id="product-title" className="break-words font-heading text-2xl font-black uppercase leading-tight tracking-tight text-text-pure sm:text-4xl">{product.name}</h1>
        {product.scientificName && <p className="mt-0.5 break-words font-body text-xs italic text-primary-neon/80">🔬 Danh pháp: {product.scientificName}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-y border-white/5 py-3">
        <span className="flex items-center gap-1 text-yellow-400"><Star aria-hidden="true" className="h-4 w-4 fill-current" /><b className="text-sm">{Number(product.rating).toFixed(1)}</b></span>
        <span aria-hidden="true" className="text-text-dark">|</span>
        <span className="text-text-muted">{product.reviews?.length || 0} Bản kiểm định</span>
        <span aria-hidden="true" className="text-text-dark">|</span>
        <span className={product.in_stock ? "font-bold text-primary-neon" : "font-bold text-text-dark"}>{product.in_stock ? "● KHO SẴN SÀNG" : "○ HẾT SINH KHỐI"}</span>
      </div>
      <p className="break-words font-sans text-xs leading-relaxed text-text-dark">{product.shortDescription}</p>
      <div className="my-2 break-words text-3xl font-black tracking-tight text-text-pure neon-text-cyan">{formatVND(selectedVariant?.price ?? product.price)}</div>
      <VariantSelector variants={product.variants} selectedVariantId={props.selectedVariantId} onSelect={props.onSelectVariant} />
      <QuantityActions availableQuantity={props.availableQuantity} isFavorite={props.isFavorite} quantity={props.quantity} onAddToCart={props.onAddToCart} onChangeQuantity={props.onChangeQuantity} onToggleFavorite={props.onToggleFavorite} />
    </section>
  );
}
