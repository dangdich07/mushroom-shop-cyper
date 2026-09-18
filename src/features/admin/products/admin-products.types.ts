import type { MushroomCategory } from "@/types/product.types";

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  scientificName?: string;
  category: MushroomCategory;
  price: number;
  compareAtPrice?: number;
  image: string;
  shortDescription: string;
  sku: string;
  tags: string[];
  variantsActive: boolean;
  variantCount: number;
  variants: AdminProductVariant[];
}

export interface AdminProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
}

export interface AdminInventoryAdjustment {
  variantId: string;
  stockQuantity: number;
  reason: string;
}

export interface AdminProductFormData {
  name: string;
  slug: string;
  scientificName: string;
  category: MushroomCategory;
  price: number;
  compareAtPrice: number;
  image: string;
  shortDescription: string;
  sku: string;
  tags: string[];
}
