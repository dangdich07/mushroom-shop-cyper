import type {
  KnowledgeSectionTone,
  ProductShowcaseTone,
} from "./home.types";

export const HOME_SECTION_STYLES = {
  hero: "relative isolate overflow-hidden border-b border-white/5",
  stats: "relative z-10 border-b border-white/5",
  categories: "relative z-10 border-b border-white/5",
  product: {
    flash: "relative z-10 border-b border-white/5",
    catalog: "relative z-10 border-b border-white/5",
  } satisfies Record<ProductShowcaseTone, string>,
  knowledge: {
    default: "relative z-10 border-b border-white/5",
    muted: "relative z-10 border-b border-white/5",
    immersive: "relative z-10 overflow-hidden border-b border-white/5",
  } satisfies Record<KnowledgeSectionTone, string>,
  faq: "relative z-10 border-b border-white/5",
  cta: "relative z-10 overflow-hidden text-center",
} as const;
