"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Dna, FlaskConical } from "lucide-react";
import { Container } from "@/components/layout/container";

const CATALOG_HERO_IMAGE = "/images/catalog-lingzhi-lab.webp";

export function CatalogHero() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="relative isolate overflow-hidden border-b border-primary-neon/20 bg-[#03101d]">
      {!imageFailed ? (
        <img
          src={CATALOG_HERO_IMAGE}
          alt=""
          onError={() => setImageFailed(true)}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center] opacity-75"
        />
      ) : (
        <div className="absolute inset-y-0 right-0 -z-20 w-full overflow-hidden bg-[radial-gradient(circle_at_72%_42%,rgba(0,245,255,0.22),transparent_24%),linear-gradient(120deg,#061a2a,#03101d)] sm:w-[68%] lg:w-[60%]">
          <div aria-hidden="true" className="absolute right-[11%] top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-cyan-300/25 shadow-[0_0_60px_rgba(0,245,255,0.12),inset_0_0_50px_rgba(0,245,255,0.08)] sm:h-56 sm:w-56" />
          <div aria-hidden="true" className="absolute right-[17%] top-1/2 flex h-32 w-32 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-300 sm:h-40 sm:w-40">
            <FlaskConical className="h-16 w-16 opacity-75 sm:h-20 sm:w-20" />
          </div>
        </div>
      )}

      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#03101d_0%,rgba(3,16,29,0.96)_37%,rgba(3,16,29,0.62)_64%,rgba(3,16,29,0.14))]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,245,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.045)_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div aria-hidden="true" className="absolute inset-y-0 left-8 w-px bg-primary-neon/40" />

      <Container wide className="relative flex min-h-[120px] items-center py-[8px]">
        <div className="w-full max-w-[820px] pl-2 sm:pl-5 lg:pr-20">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-slate-300">
            <Link href="/" className="inline-flex min-h-11 items-center transition-colors hover:text-cyan-300 focus-visible:bio-focus">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4 text-cyan-300/60" aria-hidden="true" />
            <span aria-current="page" className="text-cyan-100">Danh mục nấm</span>
          </nav>

          <h1 className="font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.035em] text-[#f8fafc] sm:text-[30px]">
            Danh mục nấm
          </h1>
          <p className="mt-[6px] max-w-[740px] text-[12px] leading-[18px] text-slate-300">
            Khám phá các sản phẩm nấm dược liệu, nấm thực phẩm và giải pháp nuôi trồng được cập nhật trực tiếp từ danh mục CyberMushroom.
          </p>
        </div>

        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-start gap-3 border-l border-cyan-300/30 pl-4 font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-cyan-100/70 lg:flex">
          <Dna className="mt-0.5 h-5 w-5 text-cyan-300" aria-hidden="true" />
          Nature<br />Science<br />Health
        </div>
      </Container>
    </section>
  );
}
