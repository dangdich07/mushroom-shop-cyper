import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Container } from "./container";

export function AnnouncementBar() {
  return (
    <div className="border-b border-primary-neon/15 bg-[linear-gradient(90deg,rgba(139,92,246,0.12),rgba(0,245,255,0.08),rgba(139,92,246,0.12))]">
      <Container wide className="flex min-h-7 items-center justify-between gap-4 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-text-dark sm:text-[9px]">
        <Link href="/track-order" className="inline-flex min-h-7 items-center gap-2 transition-colors hover:text-primary-neon focus-visible:bio-focus">
          <MapPin className="h-3 w-3 text-primary-neon" aria-hidden="true" />
          Theo dõi hành trình đơn hàng
        </Link>
        <Link href="/promotions" className="hidden min-h-7 items-center gap-2 transition-colors hover:text-primary-neon focus-visible:bio-focus sm:inline-flex">
          <Sparkles className="h-3 w-3 text-primary-neon" aria-hidden="true" />
          Trung tâm ưu đãi
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </Container>
    </div>
  );
}
