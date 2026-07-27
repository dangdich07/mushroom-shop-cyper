"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import type { OrderStatusType } from "@/types/payment.types";

interface UpdateStatusResponse { success: boolean; error?: string }

export async function updateOrderStatusAdminAction(
  orderId: string,
  newStatus: OrderStatusType,
  accessToken: string,
  restock = false,
): Promise<UpdateStatusResponse> {
  try {
    const admin = await requireAdmin(accessToken);
    const { data, error } = await supabaseServiceRole.rpc("admin_transition_order", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_actor_id: admin.id,
      p_restock: restock,
    });
    if (error) throw new Error("Không thể cập nhật đơn hàng.");
    const result = data as { success?: boolean } | null;
    if (!result?.success) throw new Error("Chuyển trạng thái không hợp lệ.");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể cập nhật đơn hàng.",
    };
  }
}
