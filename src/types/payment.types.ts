export type OrderStatusType = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentMethodType = "VIETQR" | "BANK_TRANSFER" | "COD";
export type PaymentStatusType = "PENDING" | "WAITING" | "PAID" | "FAILED" | "REFUNDED";

export interface CheckoutItemPayload {
  productId: string;
  quantity: number;
}

export interface CheckoutInput {
  shippingName: string;
  shippingPhone: string;
  shippingDetail: string;
  shippingArea: string;
  paymentMethod: PaymentMethodType;
  items: CheckoutItemPayload[];
  voucherCode?: string;
}

export interface ServerActionResponse {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface DbProductResponse {
  id: string;
  price: number;
  in_stock: boolean;
  name: string;
}