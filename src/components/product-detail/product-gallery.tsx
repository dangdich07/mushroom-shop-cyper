"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductDetailImage } from "./product-detail.types";

interface ProductGalleryProps {
  images: ProductDetailImage[];
  productName: string;
  selectedImage: string;
  onSelectImage: (url: string) => void;
}

function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(!src.trim());

  if (failed) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-3 bg-background-dark text-center text-text-dark", className)} role="img" aria-label={`Không có ảnh cho ${alt}`}>
        <ImageOff aria-hidden="true" className="h-8 w-8" />
        <span className="px-4 font-mono text-[10px] uppercase tracking-[0.16em]">Ảnh đang cập nhật</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("h-full w-full object-cover", className)} />;
}

export function ProductGallery({ images, productName, selectedImage, onSelectImage }: ProductGalleryProps) {
  return (
    <section aria-label="Thư viện ảnh sản phẩm" className="min-w-0 space-y-3">
      <div className="relative aspect-square w-full overflow-hidden border border-white/10 bg-background-dark">
        <GalleryImage src={selectedImage} alt={productName} className="opacity-85" />
      </div>

      {images.length > 1 && (
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Chọn ảnh sản phẩm">
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
                  "h-16 w-16 shrink-0 overflow-hidden border bg-black/30 focus-visible:bio-focus",
                  selected ? "border-primary-neon ring-1 ring-primary-neon" : "border-white/10",
                )}
              >
                <GalleryImage src={image.url} alt={image.alt} />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
