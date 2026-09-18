import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type { HomeSectionProps } from "./home.types";

export function HomeHero({ children, className }: HomeSectionProps) {
  return (
    <section className={cn(HOME_SECTION_STYLES.hero, className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,var(--home-glow-cyan),transparent_42%),radial-gradient(circle_at_18%_72%,var(--home-glow-violet),transparent_36%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(0,245,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.045)_1px,transparent_1px)] [background-size:56px_56px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-neon/35 to-transparent"
      />
      {children}
    </section>
  );
}
