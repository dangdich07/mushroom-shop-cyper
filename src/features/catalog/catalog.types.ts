import type { MushroomCategory, Product } from "@/types/product.types";

export type CatalogSort = "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

export interface CatalogFilters {
  category: MushroomCategory | "ALL";
  search: string;
  minPrice: number;
  maxPrice: number;
  sort: CatalogSort;
  page: number;
  pageSize: number;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}
