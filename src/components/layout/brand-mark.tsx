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
        "group inline-flex min-h-11 items-center gap-2 focus-visible:bio-focus",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center bg-primary-neon font-mono text-sm font-black tracking-tighter text-background-deep transition-[background-color,box-shadow] duration-[var(--motion-duration-normal)] group-hover:bg-primary-cyan group-hover:shadow-neon-cyan"
      >
        M
      </span>
      {!compact && (
        <span className="font-heading text-sm font-black uppercase tracking-wider text-text-pure sm:text-base">
          CYBER
          <span className="text-primary-neon transition-colors group-hover:text-primary-cyan">
            MUSHROOM
          </span>
        </span>
      )}
    </Link>
  );
}
