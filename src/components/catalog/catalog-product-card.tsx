"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff, PackageCheck, PackageX, ShoppingCart } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CatalogProductCardProps } from "./catalog.types";

export function CatalogProductCard({
  list,
  onAdd,
  product,
}: CatalogProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const variant = product.defaultVariant;

  return (
    <article
      className={`group flex min-w-0 overflow-hidden border border-white/5 bg-background-card/35 transition-[transform,border-color,box-shadow] duration-300 hover:border-primary-neon/30 hover:shadow-ambient-cyan motion-reduce:transform-none motion-reduce:transition-none ${
        list ? "flex-col sm:flex-row" : "flex-col hover:-translate-y-1"
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className={`relative block shrink-0 overflow-hidden border-white/5 bg-black/40 focus-visible:bio-focus ${
          list
            ? "aspect-[4/3] w-full border-b sm:aspect-square sm:w-44 sm:border-b-0 sm:border-r"
            : "aspect-square w-full border-b"
        }`}
      >
        {!imageFailed && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover opacity-80 transition-[transform,opacity] duration-500 group-hover:scale-105 group-hover:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center font-mono text-[10px] uppercase text-text-dark">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            Chưa có ảnh
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <span className="truncate font-mono text-[9px] uppercase tracking-wider text-text-dark">
            SKU: {product.sku}
          </span>
          <span
            className={`inline-flex min-h-6 items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-black uppercase ${
              variant
                ? "border-status-success/30 bg-status-success/10 text-status-success"
                : "border-status-warning/30 bg-status-warning/10 text-status-warning"
            }`}
          >
            {variant ? (
              <PackageCheck className="h-3 w-3" aria-hidden="true" />
            ) : (
              <PackageX className="h-3 w-3" aria-hidden="true" />
            )}
            {variant ? "Có biến thể" : "Chưa có biến thể"}
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="min-w-0 focus-visible:bio-focus"
        >
          <h2 className="line-clamp-2 break-words font-heading text-sm font-black uppercase leading-snug text-text-pure transition-colors group-hover:text-primary-neon">
            {product.name}
          </h2>
        </Link>

        {variant && (
          <p className="break-words font-mono text-[9px] uppercase tracking-wide text-primary-cyan">
            {variant.name} · {variant.sku}
          </p>
        )}
        <p className={`break-words text-[11px] leading-relaxed text-text-dark ${list ? "line-clamp-3" : "line-clamp-2"}`}>
          {product.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
          <b className="font-mono text-sm text-text-pure">{formatVND(product.price)}</b>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/10 px-3 font-mono text-[10px] font-black uppercase text-text-muted transition-colors hover:border-primary-neon hover:bg-primary-neon hover:text-background-deep focus-visible:bio-focus"
            aria-label={`Thêm ${product.name} vào giỏ`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span className={list ? "inline" : "hidden xl:inline"}>Nạp nhanh</span>
          </button>
        </div>
      </div>
    </article>
  );
}
