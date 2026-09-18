import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminReview } from "./admin-reviews.types";

interface ReviewRow {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  products: { name: string } | null;
}

export async function getAdminReviews(client: SupabaseClient): Promise<AdminReview[]> {
  const { data, error } = await client
    .from("reviews")
    .select("id, product_id, user_name, rating, comment, is_verified_purchase, created_at, products(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error("ADMIN_REVIEWS_QUERY_FAILED");
  return ((data ?? []) as unknown as ReviewRow[]).map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? "Sản phẩm không còn tồn tại",
    userName: row.user_name,
    rating: Number(row.rating),
    comment: row.comment,
    isVerifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
  }));
}
