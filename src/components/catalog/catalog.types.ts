import type { MushroomCategory, Product } from "@/types/product.types";
import type { CatalogSort } from "@/features/catalog/catalog.types";

export interface CatalogFilterValues {
  category: MushroomCategory | "ALL";
  maxPrice: number;
  minPrice: number;
  searchInput: string;
  sort: CatalogSort;
}

export interface CatalogFilterActions {
  onCategoryChange: (value: MushroomCategory | "ALL") => void;
  onMaxPriceChange: (value: number) => void;
  onMinPriceChange: (value: number) => void;
  onReset: () => void;
  onSearchInputChange: (value: string) => void;
  onSortChange: (value: CatalogSort) => void;
}

export interface CatalogFilterPanelProps
  extends CatalogFilterValues,
    CatalogFilterActions {
  idPrefix: string;
}

export interface CatalogProductCardProps {
  list: boolean;
  onAdd: () => void;
  product: Product;
}
