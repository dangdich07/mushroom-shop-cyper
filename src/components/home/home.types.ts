import type { ReactNode } from "react";

export interface HomeSectionProps {
  children: ReactNode;
  className?: string;
}

export type ProductShowcaseTone = "flash" | "catalog";

export type KnowledgeSectionTone = "default" | "muted" | "immersive";
