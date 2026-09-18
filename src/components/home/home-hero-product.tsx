"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Dna, ScanLine, Sparkles } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { Product } from "@/types/product.types";

interface HomeHeroProductProps {
  product?: Product;
}

export function HomeHeroProduct({ product }: HomeHeroProductProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [product?.id, product?.image]);

  const hasImage = Boolean(product?.image) && !imageFailed;

  return (
    <div className="relative isolate h-full min-h-[25rem] w-full overflow-hidden bg-[radial-gradient(circle_at_54%_40%,rgba(0,217,255,0.19),transparent_30%),linear-gradient(145deg,rgba(7,33,52,0.96),rgba(3,13,25,0.9))] lg:min-h-[30rem]">
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.055)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />

      {hasImage ? (
        <img
          key={product?.id}
          src={product?.image}
          alt={product?.name ?? "Sản phẩm CyberMushroom"}
          onError={() => setImageFailed(true)}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-transform duration-[var(--motion-duration-slow)] motion-safe:hover:scale-[1.025] motion-reduce:transition-none"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div aria-hidden="true" className="absolute h-[26rem] w-[26rem] rounded-full border border-primary-neon/15 shadow-[0_0_80px_rgba(0,245,255,0.13),inset_0_0_80px_rgba(0,245,255,0.06)] sm:h-[31rem] sm:w-[31rem]" />
          <div aria-hidden="true" className="relative mt-3 h-64 w-72 text-primary-neon sm:h-80 sm:w-96">
            <span className="absolute bottom-8 left-[22%] h-28 w-8 -rotate-6 rounded-b-[45%] rounded-t-[38%] bg-gradient-to-b from-cyan-100/85 via-primary-neon/55 to-cyan-900/30 shadow-[0_0_28px_rgba(0,245,255,0.28)]" />
            <span className="absolute left-[7%] top-[31%] h-16 w-32 -rotate-6 rounded-[65%_65%_35%_35%] border border-cyan-100/65 bg-gradient-to-b from-amber-300/85 via-orange-700/75 to-red-950/85 shadow-[0_0_35px_rgba(0,245,255,0.2)]" />
            <span className="absolute bottom-7 left-[51%] h-36 w-10 rotate-6 rounded-b-[45%] rounded-t-[38%] bg-gradient-to-b from-cyan-50/90 via-primary-neon/60 to-cyan-900/30 shadow-[0_0_32px_rgba(0,245,255,0.3)]" />
            <span className="absolute left-[31%] top-[16%] h-24 w-44 rotate-3 rounded-[65%_65%_32%_32%] border border-cyan-100/70 bg-gradient-to-b from-amber-200/90 via-orange-700/80 to-red-950/90 shadow-[0_0_42px_rgba(0,245,255,0.23)]" />
            <span className="absolute bottom-6 right-[8%] h-24 w-7 rotate-[11deg] rounded-b-[45%] rounded-t-[38%] bg-gradient-to-b from-cyan-50/80 via-primary-neon/50 to-cyan-900/30" />
            <span className="absolute right-0 top-[42%] h-14 w-28 rotate-[11deg] rounded-[65%_65%_32%_32%] border border-cyan-100/55 bg-gradient-to-b from-amber-300/75 via-orange-800/70 to-red-950/85" />
          </div>
        </div>
      )}

      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,13,25,0.72),transparent_24%,transparent_68%,rgba(3,13,25,0.44)),linear-gradient(180deg,rgba(3,13,25,0.08)_35%,rgba(3,13,25,0.9))]" />
      <div aria-hidden="true" className="absolute bottom-[8%] left-[18%] right-[13%] top-[7%] rounded-[48%_48%_20%_20%/18%_18%_9%_9%] border border-primary-neon/35 shadow-[inset_0_0_55px_rgba(0,245,255,0.07),0_0_35px_rgba(0,245,255,0.1)]" />
      <div aria-hidden="true" className="absolute bottom-[12%] left-[22%] right-[17%] top-[11%] rounded-[48%_48%_20%_20%/18%_18%_9%_9%] border border-white/10" />
      <div aria-hidden="true" className="absolute left-[12%] right-[7%] top-[46%] h-px bg-gradient-to-r from-transparent via-primary-neon/90 to-transparent shadow-[0_0_18px_#00f5ff] motion-safe:animate-pulse motion-reduce:animate-none" />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-control border border-primary-neon/35 bg-[#03101d]/80 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-200 backdrop-blur-md sm:left-6 sm:top-6">
        <Sparkles className="h-3.5 w-3.5 text-primary-neon" aria-hidden="true" />
        Dữ liệu sản phẩm trực tiếp
      </div>
      <div className="absolute right-5 top-20 z-20 hidden w-28 border-l border-primary-neon/30 pl-3 font-mono text-[8px] uppercase leading-5 tracking-[0.14em] text-cyan-100/70 sm:block">
        <Dna className="mb-2 h-5 w-5 text-primary-neon" aria-hidden="true" />
        Phân tích<br />mẫu vật<br />sinh học
      </div>
      <ScanLine className="absolute right-6 top-7 z-20 hidden h-5 w-5 text-primary-neon/65 sm:block" aria-hidden="true" />

      {product ? (
        <div className="absolute inset-x-4 bottom-4 z-20 rounded-[10px] border border-primary-neon/20 bg-[#03101d]/80 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary-neon">
            {product.scientificName || product.sku}
          </p>
          <div className="mt-1.5 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="line-clamp-2 font-heading text-xl font-bold leading-tight text-[#f8fafc] sm:text-2xl">
                {product.name}
              </h2>
              <p className="mt-1.5 font-mono text-base font-black text-primary-neon sm:text-lg">
                {formatVND(product.price)}
              </p>
            </div>
            <Link
              href={`/products/${product.slug}`}
              aria-label={`Xem chi tiết ${product.name}`}
              className="flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-control border border-primary-neon bg-primary-neon text-[#03101d] shadow-neon-cyan transition-colors hover:bg-white focus-visible:bio-focus"
            >
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-5 bottom-5 z-20 rounded-[10px] border border-primary-neon/20 bg-[#03101d]/80 p-5 backdrop-blur-xl">
          <p className="font-heading text-base font-bold text-[#f8fafc]">Danh mục đang được đồng bộ</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">Khám phá các nhóm nấm và thiết bị hiện có trong danh mục.</p>
        </div>
      )}
    </div>
  );
}
