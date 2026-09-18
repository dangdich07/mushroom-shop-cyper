import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type { HomeSectionProps } from "./home.types";

export function HomeHero({ children, className }: HomeSectionProps) {
  return (
    <section className={cn(HOME_SECTION_STYLES.hero, className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(0,245,255,0.1),transparent_42%),radial-gradient(circle_at_18%_72%,rgba(139,92,246,0.07),transparent_36%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-neon/35 to-transparent"
      />
      {children}
    </section>
  );
}
