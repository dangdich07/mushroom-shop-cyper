import { HomePageClient } from "@/components/home/home-page-client";
import { getCatalogProducts } from "@/features/catalog/catalogRepository";
import type { Product } from "@/types/product.types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = [];
  let productsLoadError = false;

  try {
    const result = await getCatalogProducts({
      category: "ALL",
      search: "",
      minPrice: 0,
      maxPrice: 10_000_000,
      sort: "NEWEST",
      page: 1,
      pageSize: 8,
    });
    products = result.items;
  } catch {
    productsLoadError = true;
  }

  return (
    <HomePageClient
      products={products}
      productsLoadError={productsLoadError}
    />
  );
}
