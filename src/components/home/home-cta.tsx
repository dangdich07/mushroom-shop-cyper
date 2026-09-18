import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type { HomeSectionProps } from "./home.types";

export function HomeCta({ children, className }: HomeSectionProps) {
  return (
    <section className={cn(HOME_SECTION_STYLES.cta, className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[12%] bottom-0 h-px bg-gradient-to-r from-transparent via-primary-neon/40 to-transparent"
      />
      {children}
    </section>
  );
}
