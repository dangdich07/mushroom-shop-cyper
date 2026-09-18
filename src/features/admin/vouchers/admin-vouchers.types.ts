export type VoucherDiscountType = "PERCENT" | "FIXED";
export type VoucherStatusFilter = "ALL" | "ACTIVE" | "EXPIRING" | "EXPIRED" | "INACTIVE";

export interface AdminVoucher {
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minSubtotal: number;
  description: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminVoucherFormData {
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minSubtotal: number;
  description: string;
  expiryDate: string;
}

export interface VoucherActionPayload {
  code: string;
  discount_type: VoucherDiscountType;
  discount_value: number;
  min_subtotal: number;
  description: string;
  expiry_date: string;
}
