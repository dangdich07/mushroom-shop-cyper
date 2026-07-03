export type VoucherRewardType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

export interface SystemVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  type: VoucherRewardType;
  value: number;
  minOrderValue: number;
  endDate: string;
  isClaimed: boolean;
}

export interface WheelPrize {
  id: number;
  name: string;
  color: string;
}