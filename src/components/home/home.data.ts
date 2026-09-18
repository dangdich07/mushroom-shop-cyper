import type {
  KnowledgeSectionTone,
  ProductShowcaseTone,
} from "./home.types";

export const HOME_SECTION_STYLES = {
  hero: "relative isolate overflow-hidden border-b border-[var(--color-border-subtle)]",
  stats: "relative z-10 border-b border-[var(--color-border-subtle)]",
  categories: "relative z-10 border-b border-[var(--color-border-subtle)]",
  product: {
    flash: "relative z-10 border-b border-[var(--color-border-subtle)]",
    catalog: "relative z-10 border-b border-[var(--color-border-subtle)]",
  } satisfies Record<ProductShowcaseTone, string>,
  knowledge: {
    default: "relative z-10 border-b border-[var(--color-border-subtle)]",
    muted: "relative z-10 border-b border-[var(--color-border-subtle)]",
    immersive: "relative z-10 overflow-hidden border-b border-[var(--color-border-subtle)]",
  } satisfies Record<KnowledgeSectionTone, string>,
  faq: "relative z-10 border-b border-[var(--color-border-subtle)]",
  cta: "relative z-10 overflow-hidden text-center",
} as const;
