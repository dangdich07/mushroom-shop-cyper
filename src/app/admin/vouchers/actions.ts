"use server";

import { revalidatePath } from "next/cache";
import type { VoucherActionPayload } from "@/features/admin/vouchers/admin-vouchers.types";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

interface AdminActionResponse { success: boolean; error?: string }

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function validateVoucher(payload: VoucherActionPayload) {
  const code = payload.code.trim();
  return Boolean(
    code.length >= 2 && code.length <= 50 &&
    ["PERCENT", "FIXED"].includes(payload.discount_type) &&
    Number.isFinite(payload.discount_value) && payload.discount_value > 0 &&
    (payload.discount_type !== "PERCENT" || payload.discount_value <= 100) &&
    Number.isFinite(payload.min_subtotal) && payload.min_subtotal >= 0 &&
    payload.description.trim().length > 0 && payload.description.length <= 1000 &&
    isValidDate(payload.expiry_date)
  );
}

export async function saveVoucherAdminAction(payload: VoucherActionPayload, editingCode: string | null): Promise<AdminActionResponse> {
  try {
    await requireAdmin();
    if (!validateVoucher(payload)) return { success: false, error: "Thông tin voucher không hợp lệ." };

    const databasePayload = {
      code: payload.code.toUpperCase().trim(),
      discount_type: payload.discount_type,
      discount_value: Number(payload.discount_value),
      min_subtotal: Number(payload.min_subtotal),
      description: payload.description.trim(),
      expiry_date: payload.expiry_date,
    };
    const mutation = editingCode
      ? supabaseServiceRole.from("vouchers").update(databasePayload).eq("code", editingCode.toUpperCase().trim())
      : supabaseServiceRole.from("vouchers").insert(databasePayload);
    const { error } = await mutation;
    if (error) return { success: false, error: "Không thể lưu voucher lúc này. Hãy kiểm tra mã voucher có bị trùng hay không." };

    revalidatePath("/admin/vouchers");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể lưu voucher lúc này." };
  }
}

export async function deleteVoucherAdminAction(voucherCode: string): Promise<AdminActionResponse> {
  try {
    await requireAdmin();
    const code = voucherCode.toUpperCase().trim();
    if (code.length < 2 || code.length > 50) return { success: false, error: "Mã voucher không hợp lệ." };
    const { error } = await supabaseServiceRole.from("vouchers").delete().eq("code", code);
    if (error) return { success: false, error: "Không thể xóa voucher lúc này." };
    revalidatePath("/admin/vouchers");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể xóa voucher lúc này." };
  }
}
