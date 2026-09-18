import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusBadgeTone =
  | "neutral"
  | "cyan"
  | "violet"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode;
  tone?: StatusBadgeTone;
}

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-text-muted",
  cyan: "border-primary-neon/30 bg-primary-neon/[0.08] text-primary-neon",
  violet: "border-secondary-purple/30 bg-secondary-purple/10 text-secondary-purple",
  success: "border-status-success/35 bg-status-success/10 text-status-success",
  warning: "border-status-warning/35 bg-status-warning/10 text-status-warning",
  danger: "border-status-danger/35 bg-status-danger/10 text-status-danger",
  info: "border-status-info/35 bg-status-info/10 text-status-info",
};

export function StatusBadge({
  children,
  className,
  icon,
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-pill border px-2 py-0.5",
        "font-mono text-[9px] font-black uppercase tracking-[0.12em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
