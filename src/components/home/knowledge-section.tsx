import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type {
  HomeSectionProps,
  KnowledgeSectionTone,
} from "./home.types";

interface KnowledgeSectionProps extends HomeSectionProps {
  tone?: KnowledgeSectionTone;
}

export function KnowledgeSection({
  children,
  className,
  tone = "default",
}: KnowledgeSectionProps) {
  return (
    <section
      className={cn(
        HOME_SECTION_STYLES.knowledge[tone],
        tone === "muted" && "bg-background-dark/25",
        tone === "immersive" &&
          "bg-[linear-gradient(110deg,rgba(139,92,246,0.04),transparent_45%,rgba(0,245,255,0.035))]",
        className,
      )}
    >
      {children}
    </section>
  );
}
