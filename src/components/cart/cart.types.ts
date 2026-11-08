import type { FormEvent, ReactNode } from "react";
import type { CartItem } from "@/store/useCartStore";
import type { Voucher } from "@/types/voucher.types";

export interface CartEmptyStateProps {
  actionHref: string;
}

export interface CartItemRowProps {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

export interface CartItemsListProps {
  items: CartItem[];
  onRemove: (lineId: string) => void;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
}

export interface CartVoucherPanelProps {
  appliedVoucher: Voucher | null;
  appliedVoucherIneligibility: string | null;
  isAppliedVoucherEligible: boolean;
  isValidating: boolean;
  voucherCode: string;
  voucherError: string | null;
  voucherSuccess: string | null;
  onCodeChange: (value: string) => void;
  onRemoveVoucher: () => void;
  onSubmit: (event: FormEvent) => void;
}

export interface CartCheckoutHref {
  pathname: "/checkout";
  query: Record<string, string>;
}

export interface CartOrderSummaryProps {
  checkoutHref: CartCheckoutHref;
  discount: number;
  grandTotal: number;
  itemCount: number;
  subtotal: number;
}

export interface CartImageFallbackProps {
  children?: ReactNode;
}
