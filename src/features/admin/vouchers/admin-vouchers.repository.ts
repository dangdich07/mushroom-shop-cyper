import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminVoucher, VoucherDiscountType } from "./admin-vouchers.types";

interface VoucherRow {
  code: string;
  discount_type: VoucherDiscountType;
  discount_value: number | string;
  min_subtotal: number | string;
  description: string | null;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
}

export async function getAdminVouchers(client: SupabaseClient): Promise<AdminVoucher[]> {
  const { data, error } = await client
    .from("vouchers")
    .select("code, discount_type, discount_value, min_subtotal, description, expiry_date, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("ADMIN_VOUCHERS_QUERY_FAILED");
  return ((data ?? []) as VoucherRow[]).map((row) => ({
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minSubtotal: Number(row.min_subtotal),
    description: row.description ?? "",
    expiryDate: row.expiry_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}

export function getVoucherDisplayStatus(voucher: AdminVoucher, today: string) {
  if (!voucher.isActive) return "INACTIVE" as const;
  if (voucher.expiryDate < today) return "EXPIRED" as const;
  const expiry = new Date(`${voucher.expiryDate}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  const daysRemaining = Math.ceil((expiry.getTime() - current.getTime()) / 86_400_000);
  if (daysRemaining <= 7) return "EXPIRING" as const;
  return "ACTIVE" as const;
}
