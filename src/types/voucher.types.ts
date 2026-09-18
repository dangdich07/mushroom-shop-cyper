export interface Voucher {
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  expiryDate: string;
  minSubtotal: number;
}
