import { ArrowRight, ShoppingBag } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { StatePanel } from "@/components/ui/state-panel";
import type { CartEmptyStateProps } from "./cart.types";

export function CartEmptyState({ actionHref }: CartEmptyStateProps) {
  return (
    <section className="relative overflow-hidden rounded-[14px] border border-primary-neon/20 bg-surface-glass shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-xl" aria-labelledby="empty-cart-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,245,255,0.12),transparent_24rem)]" />
      <StatePanel
        tone="empty"
        className="relative min-h-[28rem] border-0 bg-transparent px-5 py-16 sm:py-20"
        icon={<ShoppingBag aria-hidden="true" className="h-7 w-7" />}
        title={<span id="empty-cart-title">Giỏ hàng đang trống</span>}
        description="Bạn chưa có sản phẩm nào trong giỏ. Hãy khám phá danh mục nấm và thiết bị hiện có."
        action={(
          <CyberButton href={actionHref} size="lg" trailingIcon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}>
            Khám phá sản phẩm
          </CyberButton>
        )}
      />
    </section>
  );
}
