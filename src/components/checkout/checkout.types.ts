import type { PaymentMethodType } from "@/types/payment.types";

export interface CheckoutSavedAddress {
  id: string;
  name: string;
  phone: string;
  area: string;
  detail: string;
}

export interface CheckoutFormData {
  shippingName: string;
  shippingPhone: string;
  shippingArea: string;
  shippingDetail: string;
  paymentMethod: PaymentMethodType;
}

export interface SavedAddressListProps {
  addresses: CheckoutSavedAddress[];
  disabled: boolean;
  onSelect: (address: CheckoutSavedAddress) => void;
}

export interface CheckoutShippingSectionProps {
  addresses: CheckoutSavedAddress[];
  disabled: boolean;
  formData: CheckoutFormData;
  onChange: (next: CheckoutFormData) => void;
  onSelectAddress: (address: CheckoutSavedAddress) => void;
}

export interface CheckoutPaymentMethodsProps {
  disabled: boolean;
  paymentMethod: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
}

export interface CheckoutOrderSummaryProps {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  shippingFee: number;
  estimatedBeforeDiscount: number;
  voucherCode?: string;
}

export interface CheckoutSubmitStatusProps {
  isPending: boolean;
  serverError: string | null;
}
