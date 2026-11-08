import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

export function BrandMark({ className, compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="CyberMushroom - Trang chủ"
      className={cn(
        "group inline-flex min-h-10 items-center gap-2 focus-visible:bio-focus sm:min-h-11 sm:gap-2.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative flex h-10 w-11 shrink-0 items-center justify-center overflow-visible text-primary-neon drop-shadow-[0_0_8px_rgba(0,220,255,0.55)] transition-transform duration-[var(--motion-duration-normal)] motion-safe:group-hover:-translate-y-0.5 motion-reduce:transform-none sm:h-11 sm:w-12"
      >
        <svg viewBox="0 0 80 72" className="h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brand-halo" x1="4" y1="10" x2="76" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#2DEBFF" /><stop offset="0.56" stopColor="#0076FF" /><stop offset="1" stopColor="#9D4DFF" /></linearGradient>
            <linearGradient id="brand-m" x1="18" y1="28" x2="62" y2="70" gradientUnits="userSpaceOnUse"><stop stopColor="#F5FFFF" /><stop offset="0.42" stopColor="#20E5F2" /><stop offset="1" stopColor="#0076FF" /></linearGradient>
          </defs>
          <ellipse cx="40" cy="22" rx="34" ry="11.5" transform="rotate(-4 40 22)" stroke="url(#brand-halo)" strokeWidth="5.5" />
          <ellipse cx="40" cy="22" rx="13" ry="3.6" transform="rotate(-4 40 22)" stroke="#74F7FF" strokeWidth="3" />
          <path d="M20 66L25.5 34H33L40 48L47 34H54.5L60 66H51.5L49 47L41.5 61H38.5L31 47L28.5 66H20Z" fill="url(#brand-m)" stroke="#9DFBFF" strokeWidth="0.8" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className="font-heading text-sm font-bold tracking-[-0.035em] text-text-pure sm:text-lg xl:text-xl">
          Cyber
          <span className="text-primary-neon transition-colors group-hover:text-primary-cyan">
            Mushroom
          </span>
        </span>
      )}
    </Link>
  );
}
