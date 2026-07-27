import { MockDbService } from "@/services/mockDb";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/product.types";
import type { CatalogFilters, CatalogResult } from "@/features/catalog/catalog.types";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  scientific_name: string | null;
  category: Product["category"];
  price: number | string;
  compare_at_price: number | string | null;
  rating: number | string;
  total_reviews: number;
  image: string;
  short_description: string;
  sku: string;
  tags: string[] | null;
  in_stock: boolean;
  pharmacological_effects: string[] | null;
  product_variants: Array<{
    id: string;
    product_id: string;
    name: string;
    sku: string;
    weight_grams: number | null;
    price: number | string;
    compare_at_price: number | string | null;
    stock_quantity: number;
    reserved_quantity: number;
    is_active: boolean;
  }>;
}

function mapProduct(row: ProductRow): Product {
  const variant = row.product_variants?.find(
    (item) => item.stock_quantity - item.reserved_quantity > 0,
  ) ?? row.product_variants?.[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    scientificName: row.scientific_name ?? undefined,
    category: row.category,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? undefined : Number(row.compare_at_price),
    rating: Number(row.rating),
    totalReviews: row.total_reviews,
    image: row.image,
    shortDescription: row.short_description,
    sku: row.sku,
    tags: row.tags ?? [],
    inStock: row.in_stock,
    pharmacologicalEffects: row.pharmacological_effects ?? [],
    defaultVariant: variant ? {
      id: variant.id,
      productId: variant.product_id,
      name: variant.name,
      sku: variant.sku,
      weightGrams: variant.weight_grams ?? undefined,
      price: Number(variant.price),
      compareAtPrice: variant.compare_at_price === null ? undefined : Number(variant.compare_at_price),
      stockQuantity: variant.stock_quantity,
      reservedQuantity: variant.reserved_quantity,
      isActive: variant.is_active,
    } : undefined,
  };
}

function sanitizeSearch(value: string) {
  return value.replace(/[%_,().]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

async function getMockCatalog(filters: CatalogFilters): Promise<CatalogResult> {
  let items = await MockDbService.getProducts({
    category: filters.category,
    query: filters.search,
    maxPrice: filters.maxPrice,
  });
  items = items.filter((item) => item.inStock && item.price >= filters.minPrice);
  if (filters.sort === "PRICE_ASC") items.sort((a, b) => a.price - b.price);
  if (filters.sort === "PRICE_DESC") items.sort((a, b) => b.price - a.price);
  const total = items.length;
  const start = (filters.page - 1) * filters.pageSize;
  return { items: items.slice(start, start + filters.pageSize), total, page: filters.page, pageSize: filters.pageSize };
}

export async function getCatalogProducts(filters: CatalogFilters): Promise<CatalogResult> {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === "MOCK") return getMockCatalog(filters);

  const start = (filters.page - 1) * filters.pageSize;
  const end = start + filters.pageSize - 1;
  let query = supabase
    .from("products")
    .select(
      "id,slug,name,scientific_name,category,price,compare_at_price,rating,total_reviews,image,short_description,sku,tags,in_stock,pharmacological_effects,product_variants!inner(id,product_id,name,sku,weight_grams,price,compare_at_price,stock_quantity,reserved_quantity,is_active)",
      { count: "exact" },
    )
    .eq("in_stock", true)
    .gte("price", filters.minPrice)
    .lte("price", filters.maxPrice);
  query = query
    .eq("product_variants.is_active", true)
    .order("created_at", { referencedTable: "product_variants", ascending: true });

  if (filters.category !== "ALL") query = query.eq("category", filters.category);
  const search = sanitizeSearch(filters.search);
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);

  if (filters.sort === "PRICE_ASC") query = query.order("price", { ascending: true }).order("id");
  else if (filters.sort === "PRICE_DESC") query = query.order("price", { ascending: false }).order("id");
  else query = query.order("created_at", { ascending: false }).order("id");

  const { data, error, count } = await query.range(start, end);
  if (error) throw new Error("CATALOG_QUERY_FAILED");
  return {
    items: ((data ?? []) as ProductRow[]).map(mapProduct),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}
