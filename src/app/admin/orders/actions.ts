"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import type { OrderStatusType } from "@/types/payment.types";

interface AdminActionResponse {
  success: boolean;
  error?: string;
}

const GENERIC_UPDATE_ERROR = "Không thể cập nhật đơn hàng lúc này.";
const GENERIC_TRACKING_ERROR = "Không thể thêm cập nhật hành trình lúc này.";

export async function updateOrderStatusAdminAction(
  orderId: string,
  newStatus: OrderStatusType,
  restock = false,
): Promise<AdminActionResponse> {
  try {
    const admin = await requireAdmin();
    const { data, error } = await supabaseServiceRole.rpc("admin_transition_order", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_actor_id: admin.id,
      p_restock: restock,
    });

    if (error) return { success: false, error: GENERIC_UPDATE_ERROR };

    const result = data as { success?: boolean; error_code?: string } | null;
    if (!result?.success) {
      const error = result?.error_code === "DELIVERED_ORDER_IS_TERMINAL"
        ? "Đơn đã giao là trạng thái cuối và không thể thay đổi."
        : "Chuyển trạng thái không hợp lệ.";
      return { success: false, error };
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch {
    return { success: false, error: GENERIC_UPDATE_ERROR };
  }
}

export async function addOrderTrackingAdminAction(
  orderId: string,
  title: string,
  description: string,
): Promise<AdminActionResponse> {
  try {
    const admin = await requireAdmin();
    const cleanOrderId = orderId.trim();
    const cleanTitle = title.trim().toUpperCase();
    const cleanDescription = description.trim();

    if (!cleanOrderId || !cleanTitle || !cleanDescription || cleanTitle.length > 160 || cleanDescription.length > 1000) {
      return { success: false, error: "Thông tin hành trình không hợp lệ." };
    }

    const { error } = await supabaseServiceRole.from("order_tracking").insert({
      order_id: cleanOrderId,
      title: cleanTitle,
      description: cleanDescription,
      actor_id: admin.id,
    });

    if (error) return { success: false, error: GENERIC_TRACKING_ERROR };
    revalidatePath("/admin/orders");
    return { success: true };
  } catch {
    return { success: false, error: GENERIC_TRACKING_ERROR };
  }
}
