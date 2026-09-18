import type { OrderStatusType, PaymentMethodType } from "@/types/payment.types";

export interface AdminOrderData {
  id: string;
  user_id: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  grand_total: number;
  status: OrderStatusType;
  payment_method: PaymentMethodType;
  shipping_name: string;
  shipping_phone: string;
  shipping_detail: string;
  shipping_area: string;
  items: Array<{ product_id: string; quantity: number }>;
  created_at: string;
  inventory_status: "NONE" | "RESERVED" | "COMMITTED" | "RELEASED" | "RESTOCKED";
}

export interface TrackingLogNode {
  id: string;
  title: string;
  description: string;
  created_at: string;
}
