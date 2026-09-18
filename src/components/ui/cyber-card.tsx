import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CyberCardVariant = "solid" | "glass" | "outlined" | "interactive";
type CyberCardAccent = "neutral" | "cyan" | "violet";

export interface CyberCardProps extends HTMLAttributes<HTMLElement> {
  accent?: CyberCardAccent;
  as?: "article" | "div" | "section";
  variant?: CyberCardVariant;
}

const variantClasses: Record<CyberCardVariant, string> = {
  solid: "border-white/[0.07] bg-surface-raised shadow-surface-1",
  glass: "bio-surface",
  outlined: "border-white/10 bg-transparent",
  interactive:
    "border-white/[0.07] bg-surface-raised/70 shadow-surface-1 transition-[border-color,box-shadow,transform] duration-[var(--motion-duration-normal)] motion-safe:hover:-translate-y-0.5",
};

const accentClasses: Record<CyberCardAccent, string> = {
  neutral: "",
  cyan: "hover:border-primary-neon/35 hover:shadow-ambient-cyan",
  violet: "hover:border-secondary-purple/35 hover:shadow-ambient-violet",
};

export function CyberCard({
  accent = "neutral",
  as: Component = "div",
  className,
  variant = "solid",
  ...props
}: CyberCardProps) {
  return (
    <Component
      className={cn(
        "relative rounded-card border",
        variantClasses[variant],
        accentClasses[accent],
        className,
      )}
      {...props}
    />
  );
}
