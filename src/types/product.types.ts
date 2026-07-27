export type MushroomCategory = "MEDICINAL" | "FOOD" | "EQUIPMENT";

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  weightGrams?: number;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  scientificName?: string;
  category: MushroomCategory;
  price: number;
  compareAtPrice?: number;
  rating: number;
  totalReviews: number;
  image: string;
  shortDescription: string;
  sku: string;
  tags: string[];
  inStock: boolean;
  pharmacologicalEffects?: string[];
  defaultVariant?: ProductVariant;
  variants?: ProductVariant[];
}
