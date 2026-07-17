"use server";

import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";

interface VoucherPayload {
  code: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  min_subtotal: number;
  description: string;
  expiry_date: string;
}

interface AdminActionResponse {
  success: boolean;
  error?: string;
}

// HÀM VẠN NĂNG: TỰ ĐỘNG CHUYỂN ĐỔI GIỮA INSERT HOẶC UPDATE THEO KIỂU UPSERT
export async function saveVoucherAdminAction(
  payload: VoucherPayload, 
  editingCode: string | null,
  accessToken: string
): Promise<AdminActionResponse> {
  try {
    await requireAdmin(accessToken);
    const databasePayload = {
      code: payload.code.toUpperCase().trim(),
      discount_type: payload.discount_type,
      discount_value: Number(payload.discount_value),
      min_subtotal: Number(payload.min_subtotal),
      description: payload.description.trim(),
      expiry_date: payload.expiry_date,
    };

    if (editingCode) {
      // Luồng hiệu chỉnh thông số mã cũ
      const { error } = await supabaseServiceRole
        .from("vouchers")
        .update(databasePayload)
        .eq("code", editingCode);
      if (error) throw error;
    } else {
      // Luồng cấy phôi mã hoàn toàn mới
      const { error } = await supabaseServiceRole
        .from("vouchers")
        .insert([databasePayload]);
      if (error) throw error;
    }

    revalidatePath("/admin/vouchers");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Crash hệ mạch lưu trữ ưu đãi.";
    return { success: false, error: msg };
  }
}

// LỆNH TIÊU HỦY VOUCHER KHỎI HỆ THỐNG
export async function deleteVoucherAdminAction(voucherCode: string, accessToken: string): Promise<AdminActionResponse> {
  try {
    await requireAdmin(accessToken);
    const { error } = await supabaseServiceRole
      .from("vouchers")
      .delete()
      .eq("code", voucherCode);

    if (error) throw error;

    revalidatePath("/admin/vouchers");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi thực thi lệnh tiêu hủy.";
    return { success: false, error: msg };
  }
}
