import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type { HomeSectionProps } from "./home.types";

export function HomeFaq({ children, className }: HomeSectionProps) {
  return (
    <section className={cn(HOME_SECTION_STYLES.faq, className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 bg-primary-neon/[0.025] blur-3xl"
      />
      <div className="relative">{children}</div>
    </section>
  );
}
