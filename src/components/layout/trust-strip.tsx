import {
  Headphones,
  RefreshCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Container } from "./container";

interface TrustSignal {
  description: string;
  icon: LucideIcon;
  title: string;
}

const TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: ShieldCheck,
    title: "100% hữu cơ kiểm định",
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

export function TrustStrip() {
  return (
    <Container
      aria-label="Cam kết dịch vụ"
      className="grid grid-cols-1 gap-px overflow-hidden border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4"
    >
      {TRUST_SIGNALS.map(({ description, icon: Icon, title }) => (
        <div
          key={title}
          className="flex min-h-28 items-start gap-3 bg-background-dark/95 p-5 transition-colors hover:bg-surface-raised"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary-neon/20 bg-primary-neon/[0.06] text-primary-neon">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-xs font-black uppercase leading-snug tracking-wide text-text-pure">
              {title}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-text-dark">{description}</p>
          </div>
        </div>
      ))}
    </Container>
  );
}
