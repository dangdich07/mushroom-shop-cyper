import { cn } from "@/lib/utils";
import { HOME_SECTION_STYLES } from "./home.data";
import type {
  HomeSectionProps,
  ProductShowcaseTone,
} from "./home.types";

interface ProductShowcaseProps extends HomeSectionProps {
  tone: ProductShowcaseTone;
}

export function ProductShowcase({
  children,
  className,
  tone,
}: ProductShowcaseProps) {
  return (
    <section
      className={cn(
        HOME_SECTION_STYLES.product[tone],
        tone === "flash"
          ? "bg-background-dark/35"
          : "bg-[radial-gradient(circle_at_50%_0%,rgba(0,245,255,0.035),transparent_42%)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
