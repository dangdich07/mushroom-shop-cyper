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
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-primary-neon/45 bg-primary-neon/[0.08] text-primary-neon shadow-[inset_0_0_18px_rgba(0,245,255,0.08)] transition-[background-color,box-shadow,transform] duration-[var(--motion-duration-normal)] group-hover:bg-primary-neon/[0.14] group-hover:shadow-neon-cyan motion-safe:group-hover:-translate-y-0.5 motion-reduce:transform-none sm:h-10 sm:w-10 sm:rounded-[10px]"
      >
        <span className="absolute left-1/2 top-[8px] h-[12px] w-[23px] -translate-x-1/2 rounded-t-full rounded-b-[7px] border border-current bg-primary-neon/15 sm:top-[9px] sm:h-[13px] sm:w-[25px]" />
        <span className="absolute left-1/2 top-[19px] h-[10px] w-[8px] -translate-x-1/2 rounded-b-[4px] border-x border-b border-current sm:top-[21px] sm:h-[11px]" />
        <span className="absolute left-[10px] top-[13px] h-1 w-1 rounded-full bg-current shadow-[8px_0_0_currentColor] sm:left-[12px] sm:top-[15px]" />
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
