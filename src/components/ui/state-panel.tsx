import type { HTMLAttributes, ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatePanelTone = "loading" | "empty" | "error" | "success" | "info";

interface StatePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  action?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  tone?: StatePanelTone;
  variant?: "compact" | "default";
}

const defaultIcons: Record<StatePanelTone, ReactNode> = {
  loading: <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" />,
  empty: <PackageOpen className="h-5 w-5" />,
  error: <AlertTriangle className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const toneClasses: Record<StatePanelTone, string> = {
  loading: "border-primary-neon/20 text-primary-neon",
  empty: "border-white/10 text-text-dark",
  error: "border-status-danger/30 text-status-danger",
  success: "border-status-success/30 text-status-success",
  info: "border-status-info/30 text-status-info",
};

export function StatePanel({
  action,
  className,
  description,
  icon,
  title,
  tone = "info",
  variant = "default",
  ...props
}: StatePanelProps) {
  return (
    <div
      className={cn(
        "border bg-surface-raised/45 text-center",
        variant === "compact" ? "p-4" : "px-5 py-10 sm:py-14",
        toneClasses[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      {...props}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <span className="mb-3 flex h-10 w-10 items-center justify-center border border-current/25 bg-current/[0.06]">
          {icon ?? defaultIcons[tone]}
        </span>
        <h3 className="font-heading text-sm font-black uppercase tracking-[0.08em] text-text-pure">
          {title}
        </h3>
        {description && (
          <div className="mt-2 text-sm leading-relaxed text-text-dark">{description}</div>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
