import { Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { CatalogFilterPanel } from "./catalog-filter-panel";
import type { CatalogFilterPanelProps } from "./catalog.types";

interface CatalogMobileFiltersProps
  extends Omit<CatalogFilterPanelProps, "idPrefix"> {
  isOpen: boolean;
  onClose: () => void;
}

export function CatalogMobileFilters({
  isOpen,
  onClose,
  ...filterProps
}: CatalogMobileFiltersProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Bộ lọc danh mục">
      <CatalogFilterPanel {...filterProps} idPrefix="mobile-catalog" />
      <button
        type="button"
        onClick={onClose}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 border border-primary-neon bg-primary-neon px-4 font-mono text-xs font-black uppercase tracking-wider text-background-deep transition-colors hover:bg-transparent hover:text-primary-neon focus-visible:bio-focus"
      >
        <Check className="h-4 w-4" aria-hidden="true" />
        Áp dụng và đóng
      </button>
    </Drawer>
  );
}
