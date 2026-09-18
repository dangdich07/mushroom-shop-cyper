import type { Product, ProductVariant } from "@/types/product.types";

export type ProductDetailTab = "DESCRIPTION" | "SPECIFICATIONS" | "REVIEWS" | "QA";

export interface ProductDetailReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductDetailImage {
  url: string;
  alt: string;
}

export interface ProductDetailData {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  category: Product["category"];
  rating: number;
  in_stock: boolean;
  scientificName: string;
  shortDescription: string;
  slug: string;
  reviews: ProductDetailReview[];
  tags?: string[];
  variants: ProductVariant[];
  images: ProductDetailImage[];
}

export interface ProductDetailClientProps {
  initialProduct: ProductDetailData;
  relatedProducts: Product[];
}
