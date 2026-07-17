"use server";

import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";

interface UpdateProductPayload {
  price: number;
  in_stock: boolean;
}

interface AdminProductResponse {
  success: boolean;
  error?: string;
}

// LỆNH ĐIỀU CHỈNH THÔNG SỐ LÂM SÀNG CỦA MẪU NẤM
export async function updateProductAdminAction(
  productId: string,
  payload: UpdateProductPayload,
  accessToken: string
): Promise<AdminProductResponse> {
  try {
    await requireAdmin(accessToken);
    const { error } = await supabaseServiceRole
      .from("products")
      .update({
        price: Number(payload.price),
        in_stock: payload.in_stock,
      })
      .eq("id", productId);

    if (error) throw error;

    // Giải phóng bộ đệm cũ, ép các trang sản phẩm nạp giá trị mới hỏa tốc
    revalidatePath("/admin/products");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Crash hệ mạch cập nhật kho.";
    return { success: false, error: msg };
  }
}
