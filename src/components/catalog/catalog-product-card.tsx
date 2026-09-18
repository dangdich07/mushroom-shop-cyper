"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import {
  Dna,
  Heart,
  PackageCheck,
  PackageX,
  ShoppingCart,
  Star,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import type { CatalogProductCardProps } from "./catalog.types";

export function CatalogProductCard({ list, onAdd, product }: CatalogProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const addToast = useOverlayStore((state) => state.addToast);
  const isFavorite = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id),
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const variant = product.defaultVariant;
  const canAdd = product.inStock;
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice;
  const currentPrice = variant?.price ?? product.price;
  const discount =
    compareAtPrice && compareAtPrice > currentPrice
      ? Math.round((1 - currentPrice / compareAtPrice) * 100)
      : 0;

  useEffect(() => {
    setImageFailed(false);
  }, [product.id, product.image]);

  function handleToggleWishlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
    addToast({
      title: isFavorite ? "ĐÃ BỎ YÊU THÍCH" : "ĐÃ THÊM YÊU THÍCH",
      description: isFavorite
        ? `Đã gỡ ${product.name} khỏi danh sách yêu thích.`
        : `Đã thêm ${product.name} vào danh sách yêu thích.`,
      type: "SUCCESS",
    });
  }

  return (
    <article
      className={`group relative min-w-0 overflow-hidden rounded-[12px] border border-primary-neon/20 bg-surface-raised/95 shadow-[0_14px_38px_rgba(0,0,0,0.2)] transition-[transform,border-color,box-shadow] duration-300 hover:border-primary-neon/50 hover:shadow-[0_18px_46px_rgba(0,0,0,0.28),0_0_28px_rgba(0,245,255,0.08)] motion-reduce:transform-none motion-reduce:transition-none ${
        list
          ? "grid grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)]"
          : "flex flex-col motion-safe:hover:-translate-y-1"
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className={`relative block overflow-hidden bg-[#061522] focus-visible:bio-focus ${
          list
            ? "aspect-[16/9] border-b border-primary-neon/15 md:h-full md:min-h-64 md:aspect-auto md:border-b-0 md:border-r"
            : "aspect-[16/8.5] border-b border-primary-neon/15"
        }`}
      >
        {product.image && !imageFailed ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover opacity-95 transition-transform duration-500 motion-safe:group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(0,245,255,0.18),transparent_28%),linear-gradient(145deg,#0b2940,#03101d)] text-cyan-300">
            <div className="flex flex-col items-center gap-3 rounded-full border border-primary-neon/20 bg-primary-neon/[0.05] p-7 shadow-[0_0_38px_rgba(0,245,255,0.08)]">
              <Dna className="h-9 w-9" aria-hidden="true" />
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-cyan-100/70">
                {product.category}
              </span>
            </div>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#03101d]/75 via-transparent to-transparent" />

        {product.tags?.[0] ? (
          <span className="absolute left-3 top-3 rounded-full border border-primary-neon/40 bg-[#03101d]/80 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
            {product.tags[0]}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-violet-500/90 px-2.5 py-1 font-mono text-[9px] font-black text-white shadow-lg">
            -{discount}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isFavorite ? `Xóa ${product.name} khỏi mục yêu thích` : `Thêm ${product.name} vào mục yêu thích`}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#03101d]/75 text-white backdrop-blur-sm transition-colors hover:border-primary-neon hover:text-primary-neon focus-visible:bio-focus"
        >
          <Heart className={`h-[18px] w-[18px] ${isFavorite ? "fill-primary-neon text-primary-neon" : ""}`} aria-hidden="true" />
        </button>
      </Link>

      <div className={`flex min-w-0 flex-1 flex-col ${list ? "p-5 sm:p-6" : "p-4"}`}>
        <div className={list ? "grid min-w-0 flex-1 gap-5 md:grid-cols-[minmax(0,1fr)_13rem]" : "flex min-w-0 flex-1 flex-col"}>
          <div className="min-w-0">
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-300/80">
              {product.scientificName || `SKU: ${product.sku}`}
            </p>
            {product.scientificName ? (
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-text-dark">
                SKU: {product.sku}
              </p>
            ) : null}

            <Link href={`/products/${product.slug}`} className="mt-2 block focus-visible:bio-focus">
              <h2 className={`break-words font-heading font-bold leading-snug text-text-pure transition-colors group-hover:text-primary-neon ${list ? "text-xl" : "line-clamp-2 min-h-11 text-[15px]"}`}>
                {product.name}
              </h2>
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-dark">
              <span className="inline-flex items-center gap-1 text-status-warning">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <b>{product.rating.toFixed(1)}</b>
              </span>
              <span>({product.totalReviews} đánh giá)</span>
            </div>

            {list ? (
              <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-text-muted">
                {product.shortDescription}
              </p>
            ) : null}

            {variant ? (
              <p className="mt-3 truncate font-mono text-[9px] uppercase tracking-wide text-text-dark">
                {variant.name} · {variant.sku}
              </p>
            ) : null}
          </div>

          <div className={`flex flex-col ${list ? "border-t border-primary-neon/10 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0" : "mt-auto"}`}>
            <div className={`${list ? "" : "mt-4 border-t border-primary-neon/10 pt-3"} flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono`}>
              <strong className="text-lg font-black text-primary-neon">{formatVND(currentPrice)}</strong>
              {compareAtPrice && compareAtPrice > currentPrice ? (
                <span className="text-[10px] text-text-dark line-through">{formatVND(compareAtPrice)}</span>
              ) : null}
            </div>

            <p className={`mt-2 flex items-center gap-2 font-mono text-[9px] font-bold uppercase ${canAdd ? "text-status-success" : "text-status-danger"}`}>
              {canAdd ? <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <PackageX className="h-3.5 w-3.5" aria-hidden="true" />}
              {canAdd ? "Còn hàng" : "Tạm hết hàng"}
            </p>

            <button
              type="button"
              onClick={onAdd}
              disabled={!canAdd}
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-primary-neon/75 bg-primary-neon/[0.06] px-4 font-heading text-xs font-bold text-primary-neon transition-colors hover:bg-primary-neon hover:text-background-deep focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-45 ${list ? "mt-auto" : "mt-4"}`}
              aria-label={`Thêm ${product.name} vào giỏ`}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
