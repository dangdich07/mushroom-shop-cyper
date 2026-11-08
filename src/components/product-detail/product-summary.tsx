"use client";

import { Boxes, CheckCircle2, FlaskConical, Star } from "lucide-react";
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
  const currentPrice = selectedVariant?.price ?? product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > currentPrice);
  const discountPercentage = hasDiscount && compareAtPrice
    ? Math.round((1 - currentPrice / compareAtPrice) * 100)
    : 0;
  const rating = Math.max(0, Math.min(5, Number(product.rating) || 0));
  const isAvailable = product.in_stock && props.availableQuantity > 0;

  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-primary-neon/20 bg-surface-glass p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24),0_0_32px_rgba(0,245,255,0.05)] backdrop-blur-xl sm:p-6 lg:p-7"
      aria-labelledby="product-title"
    >
      <div className="min-w-0 space-y-3">
        {product.scientificName ? (
          <span className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-control border border-primary-neon/30 bg-primary-neon/[0.06] px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-neon">
            <FlaskConical aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{product.scientificName}</span>
          </span>
        ) : null}
        <h1 id="product-title" className="break-words font-heading text-[clamp(1.9rem,3vw,2.75rem)] font-bold leading-[1.06] tracking-[-0.035em] text-text-pure">
          {product.name}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-primary-neon/10 py-3 text-sm">
        <span className="inline-flex items-center gap-1" aria-label={`${rating.toFixed(1)} trên 5 sao`}>
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              aria-hidden="true"
              className={`h-4 w-4 text-status-warning ${index < Math.round(rating) ? "fill-current" : "fill-transparent opacity-45"}`}
            />
          ))}
        </span>
        <strong className="text-text-pure">{rating.toFixed(1)}</strong>
        <span className="text-text-dark">({product.totalReviews} đánh giá)</span>
        <span aria-hidden="true" className="hidden h-4 w-px bg-primary-neon/20 sm:block" />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dark">
          SKU: <b className="text-text-muted">{selectedVariant?.sku ?? product.sku}</b>
        </span>
      </div>

      <p className="max-w-2xl break-words text-sm leading-6 text-text-muted sm:text-[15px] sm:leading-7">{product.shortDescription}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-1">
        <strong className="break-words font-heading text-3xl font-bold tracking-tight text-primary-neon sm:text-[2.1rem]">
          {formatVND(currentPrice)}
        </strong>
        {hasDiscount && compareAtPrice ? (
          <>
            <span className="font-mono text-sm text-text-dark line-through">{formatVND(compareAtPrice)}</span>
            <span className="rounded-pill border border-secondary-purple/45 bg-secondary-purple/15 px-3 py-1.5 font-mono text-[10px] font-bold text-violet-300">
              -{discountPercentage}%
            </span>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex min-h-12 items-center gap-3 rounded-control border border-primary-neon/15 bg-background-dark/35 px-4">
          <Boxes aria-hidden="true" className="h-5 w-5 shrink-0 text-primary-neon" />
          <span className="text-sm text-text-muted">Biến thể: <b className="text-text-pure">{selectedVariant?.name ?? "Mặc định"}</b></span>
        </div>
        <div className={`flex min-h-12 items-center gap-3 rounded-control border px-4 ${isAvailable ? "border-status-success/25 bg-status-success/[0.07] text-status-success" : "border-status-danger/25 bg-status-danger/[0.07] text-status-danger"}`}>
          <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{isAvailable ? `Còn ${props.availableQuantity} sản phẩm` : "Tạm hết hàng"}</span>
        </div>
      </div>

      <VariantSelector variants={product.variants} selectedVariantId={props.selectedVariantId} onSelect={props.onSelectVariant} />
      <QuantityActions
        availableQuantity={props.availableQuantity}
        isFavorite={props.isFavorite}
        quantity={props.quantity}
        onAddToCart={props.onAddToCart}
        onChangeQuantity={props.onChangeQuantity}
        onToggleFavorite={props.onToggleFavorite}
      />
    </section>
  );
}
