import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminProduct } from "./admin-products.types";

interface ProductRow {
  id: string; slug: string; name: string; scientific_name: string | null; category: AdminProduct["category"];
  price: number | string; compare_at_price: number | string | null; image: string; short_description: string;
  sku: string; tags: string[] | null; product_variants: Array<{
    id: string; name: string; sku: string; price: number | string; stock_quantity: number;
    reserved_quantity: number; is_active: boolean;
  }> | null;
}

export async function getAdminProducts(client: SupabaseClient): Promise<AdminProduct[]> {
  const { data, error } = await client.from("products").select("id, slug, name, scientific_name, category, price, compare_at_price, image, short_description, sku, tags, product_variants(id, name, sku, price, stock_quantity, reserved_quantity, is_active)").order("created_at", { ascending: false });
  if (error) throw new Error("ADMIN_PRODUCTS_QUERY_FAILED");
  return ((data ?? []) as ProductRow[]).map((row) => ({
    id: row.id, slug: row.slug, name: row.name, scientificName: row.scientific_name ?? undefined,
    category: row.category, price: Number(row.price), compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
    image: row.image, shortDescription: row.short_description, sku: row.sku, tags: row.tags ?? [],
    variantsActive: Boolean(row.product_variants?.some((variant) => variant.is_active)), variantCount: row.product_variants?.length ?? 0,
    variants: (row.product_variants ?? []).map((variant) => ({
      id: variant.id, name: variant.name, sku: variant.sku, price: Number(variant.price),
      stockQuantity: variant.stock_quantity, reservedQuantity: variant.reserved_quantity, isActive: variant.is_active,
    })).sort((a, b) => a.sku.localeCompare(b.sku)),
  }));
}
