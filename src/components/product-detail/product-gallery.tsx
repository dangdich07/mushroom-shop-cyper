"use client";

import Image from "next/image";
import { ImageOff, ScanLine } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductDetailImage } from "./product-detail.types";

interface ProductGalleryProps {
  images: ProductDetailImage[];
  productName: string;
  selectedImage: string;
  onSelectImage: (url: string) => void;
}

interface GalleryImageProps {
  src: string;
  alt: string;
  sizes: string;
  compact?: boolean;
  className?: string;
}

function GalleryImage({ src, alt, sizes, compact = false, className }: GalleryImageProps) {
  const [failed, setFailed] = useState(!src.trim());

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_38%,rgba(0,245,255,0.16),transparent_25%),linear-gradient(145deg,var(--color-surface-overlay),var(--color-background-dark))] px-4 text-center text-primary-neon/75",
          className,
        )}
        role="img"
        aria-label={`Chưa có ảnh cho ${alt}`}
      >
        <span className={cn("flex items-center justify-center rounded-full border border-primary-neon/25 bg-primary-neon/[0.06]", compact ? "h-9 w-9" : "h-16 w-16 shadow-[0_0_32px_rgba(0,245,255,0.1)]")}>
          <ImageOff aria-hidden="true" className={compact ? "h-4 w-4" : "h-7 w-7"} />
        </span>
        {!compact ? <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dark">Ảnh sản phẩm đang cập nhật</span> : null}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function ProductGallery({ images, productName, selectedImage, onSelectImage }: ProductGalleryProps) {
  const selectedIndex = Math.max(0, images.findIndex((image) => image.url === selectedImage));

  return (
    <section
      aria-label="Thư viện ảnh sản phẩm"
      className="min-w-0 rounded-[14px] border border-primary-neon/25 bg-surface-glass p-3 shadow-[0_24px_70px_rgba(0,0,0,0.28),0_0_34px_rgba(0,245,255,0.06)] backdrop-blur-xl sm:p-4"
    >
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        {images.length > 1 ? (
          <div
            className="order-2 flex max-w-full gap-2 overflow-x-auto pb-1 md:order-1 md:h-[34rem] md:w-[5.25rem] md:flex-none md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pb-0 md:pr-1"
            aria-label="Chọn ảnh sản phẩm"
          >
            {images.map((image, index) => {
              const selected = selectedImage === image.url;
              return (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => onSelectImage(image.url)}
                  aria-label={`Xem ảnh ${index + 1}: ${image.alt}`}
                  aria-pressed={selected}
                  className={cn(
                    "relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[9px] border bg-background-dark transition-[border-color,box-shadow,transform] duration-300 focus-visible:bio-focus motion-reduce:transition-none md:h-[5.25rem] md:w-full",
                    selected
                      ? "border-primary-neon shadow-[0_0_18px_rgba(0,245,255,0.24)] motion-safe:scale-[0.98]"
                      : "border-white/10 opacity-70 hover:border-primary-neon/55 hover:opacity-100",
                  )}
                >
                  <GalleryImage
                    src={image.url}
                    alt={image.alt}
                    sizes="84px"
                    compact
                    className="transition-transform duration-500 motion-safe:hover:scale-105 motion-reduce:transition-none"
                  />
                  {selected ? <span aria-hidden="true" className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-primary-neon shadow-[0_0_10px_#00f5ff]" /> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="order-1 min-w-0 flex-1 md:order-2">
          <div className="relative h-[22rem] w-full overflow-hidden rounded-[10px] border border-primary-neon/15 bg-background-dark sm:h-[30rem] lg:h-[34rem]">
            <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_38%,rgba(0,245,255,0.14),transparent_24%),linear-gradient(145deg,var(--color-surface-overlay),var(--color-background-dark))] text-primary-neon/70">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-neon/20 bg-primary-neon/[0.05]">
                <ImageOff className="h-7 w-7" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dark">Ảnh sản phẩm đang cập nhật</span>
            </div>
            <GalleryImage
              key={selectedImage}
              src={selectedImage}
              alt={productName}
              sizes="(max-width: 767px) calc(100vw - 56px), (max-width: 1023px) calc(100vw - 170px), 48vw"
              className="opacity-95 transition-[opacity,transform] duration-500 motion-safe:hover:scale-[1.015] motion-reduce:transition-none"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,245,255,0.03),transparent_25%,transparent_75%,rgba(3,16,29,0.24))]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-[7px] border border-primary-neon/10" />
            <span className="absolute left-4 top-4 inline-flex min-h-9 items-center gap-2 rounded-control border border-primary-neon/25 bg-background-deep/75 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-200 backdrop-blur-md">
              <ScanLine aria-hidden="true" className="h-4 w-4 text-primary-neon" /> Mẫu vật trực tiếp
            </span>
            <span className="absolute right-4 top-4 rounded-control border border-primary-neon/25 bg-background-deep/75 px-3 py-2 font-mono text-[9px] tracking-[0.16em] text-text-muted backdrop-blur-md">
              {String(selectedIndex + 1).padStart(2, "0")} / {String(Math.max(images.length, 1)).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
