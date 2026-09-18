"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface HomeCategoryCardProps {
  description: string;
  icon: LucideIcon;
  image?: string;
  index: number;
  name: string;
  slug: string;
}

export function HomeCategoryCard({
  description,
  icon: Icon,
  image,
  index,
  name,
  slug,
}: HomeCategoryCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
    <Link
      href={`/products?category=${slug}`}
      className="group relative isolate flex min-h-48 overflow-hidden rounded-[12px] border border-cyan-300/25 bg-[#071827] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.22)] transition-[border-color,box-shadow,transform] duration-[var(--motion-duration-normal)] hover:border-primary-neon/55 hover:shadow-[0_18px_48px_rgba(0,0,0,0.3),0_0_30px_rgba(0,245,255,0.1)] focus-visible:bio-focus motion-safe:hover:-translate-y-1 motion-reduce:transform-none md:min-h-[11rem] sm:p-6"
    >
      {image && !imageFailed ? (
        <img
          src={image}
          alt=""
          onError={() => setImageFailed(true)}
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-80 transition-transform duration-[var(--motion-duration-slow)] motion-safe:group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <div className="absolute inset-0 -z-20 overflow-hidden bg-[radial-gradient(circle_at_78%_32%,rgba(0,245,255,0.35),transparent_25%),radial-gradient(circle_at_72%_75%,rgba(139,92,246,0.23),transparent_32%),linear-gradient(135deg,#0b2940,#03101d)]">
          <Icon className="absolute -bottom-8 right-4 h-40 w-40 rotate-[-9deg] text-cyan-200/15" aria-hidden="true" />
          <span aria-hidden="true" className="absolute right-24 top-4 h-24 w-24 rounded-full border border-primary-neon/15 shadow-[0_0_45px_rgba(0,245,255,0.1)]" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,13,25,0.96)_2%,rgba(3,13,25,0.84)_48%,rgba(3,13,25,0.2))]" />
      <div className="flex w-full flex-col items-start">
        <div className="flex w-full items-start justify-between gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-cyan-300/40 bg-[#03101d]/75 text-cyan-300 shadow-[inset_0_0_14px_rgba(0,245,255,0.08)] backdrop-blur-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-300/80">
            {String(index).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-auto max-w-[85%]">
          <h3 className="font-heading text-2xl font-bold leading-tight tracking-[-0.03em] text-[#f8fafc] transition-colors group-hover:text-cyan-300">
            {name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#dbe8f4]">
            {description}
          </p>
          <span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-control border border-cyan-300/55 bg-[#03101d]/80 px-3.5 font-heading text-xs font-bold text-cyan-200 backdrop-blur-sm">
            Khám phá ngay
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
