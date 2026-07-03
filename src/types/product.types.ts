export type MushroomCategory = "MEDICINAL" | "FOOD" | "EQUIPMENT";

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
}