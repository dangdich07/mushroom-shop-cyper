import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  action?: ReactNode;
  align?: "left" | "center";
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}

export function SectionHeading({
  action,
  align = "left",
  className,
  description,
  eyebrow,
  title,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex gap-5",
        align === "center"
          ? "flex-col items-center text-center"
          : "flex-col sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-primary-neon">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading text-2xl font-black uppercase leading-tight tracking-tight text-text-pure sm:text-3xl">
          {title}
        </h2>
        {description && (
          <div className="mt-3 max-w-xl text-sm leading-relaxed text-text-dark">
            {description}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
