"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

export async function deleteAdminReviewAction(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = reviewId.trim();
    if (!id || id.length > 100) return { success: false, error: "Mã đánh giá không hợp lệ." };
    const { error } = await supabaseServiceRole.from("reviews").delete().eq("id", id);
    if (error) return { success: false, error: "Không thể xóa đánh giá lúc này." };
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể xóa đánh giá lúc này." };
  }
}
