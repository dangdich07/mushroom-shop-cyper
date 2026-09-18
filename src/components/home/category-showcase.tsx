import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type { HomeSectionProps } from "./home.types";

export function CategoryShowcase({ children, className }: HomeSectionProps) {
  return (
    <section className={cn(HOME_SECTION_STYLES.categories, className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,245,255,0.025),transparent_34%,rgba(139,92,246,0.025))]"
      />
      <div className="relative">{children}</div>
    </section>
  );
}
