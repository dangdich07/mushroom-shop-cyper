import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type { HomeSectionProps } from "./home.types";

export function HomeStats({ children, className }: HomeSectionProps) {
  return (
    <section
      aria-label="Chỉ số kiểm định"
      className={cn(
        HOME_SECTION_STYLES.stats,
        "bg-background-dark/55 shadow-surface-1",
        className,
      )}
    >
      {children}
    </section>
  );
}
