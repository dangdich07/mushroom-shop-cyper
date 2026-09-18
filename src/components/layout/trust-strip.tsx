import {
  Headphones,
  RefreshCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Container } from "./container";
import { cn } from "@/lib/utils";

interface TrustSignal {
  description: string;
  icon: LucideIcon;
  title: string;
}

const TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: ShieldCheck,
    title: "Nguồn gốc được kiểm soát",
    description: "Kiểm soát hoạt chất và nguồn gốc theo từng lô.",
  },
  {
    icon: Truck,
    title: "Vận chuyển kiểm soát nhiệt",
    description: "Duy trì điều kiện phù hợp cho nấm tươi.",
  },
  {
    icon: RefreshCcw,
    title: "Hỗ trợ đổi phôi lỗi",
    description: "Tiếp nhận kiểm tra khi phôi không phát triển.",
  },
  {
    icon: Headphones,
    title: "Đồng hành kỹ thuật",
    description: "Hướng dẫn xuyên suốt chu kỳ nuôi trồng.",
  },
];

interface TrustStripProps {
  variant?: "footer" | "home";
}

export function TrustStrip({ variant = "footer" }: TrustStripProps) {
  const isHome = variant === "home";

  return (
    <Container wide={isHome}>
      <div
        aria-label="Cam kết dịch vụ"
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          isHome
            ? "gap-3 overflow-visible"
            : "gap-px overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-border-subtle)]",
        )}
      >
        {TRUST_SIGNALS.map(({ description, icon: Icon, title }) => (
          <div
            key={title}
            className={cn(
              "bg-background-dark/95 transition-colors hover:bg-surface-raised",
              isHome
                ? "grid min-h-32 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-5 rounded-panel border border-primary-neon/20 px-5 py-5 shadow-[0_16px_38px_rgba(0,0,0,0.24),0_0_22px_rgba(0,245,255,0.05)] backdrop-blur-xl xl:px-6"
                : "flex min-h-28 items-center gap-4 p-5",
            )}
          >
            <span className={cn(
              "flex shrink-0 items-center justify-center rounded-full border border-primary-neon/35 bg-primary-neon/[0.08] text-primary-neon shadow-[inset_0_0_18px_rgba(0,245,255,0.08),0_0_18px_rgba(0,245,255,0.08)]",
              isHome ? "h-14 w-14" : "h-12 w-12",
            )}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className={cn(
                "font-heading text-sm font-bold leading-snug tracking-[-0.01em] text-text-pure",
                isHome && "flex min-h-10 items-center",
              )}>
                {title}
              </h2>
              <p className={cn(
                "mt-1.5 text-xs leading-relaxed text-text-dark xl:text-[13px]",
                isHome && "min-h-10",
              )}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
