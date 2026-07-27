import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Voucher } from "@/services/mockDb";

export interface CartItem {
  id: string;
  lineId: string;
  variantId: string;
  variantName: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
}

export interface CartStoreState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  clearCart: () => void;
  reset: () => void;
  appliedVoucher: Voucher | null;
  applyVoucher: (voucher: Voucher) => void;
  removeVoucher: () => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      appliedVoucher: null,
      addItem: (product, quantity) =>
        set((state) => {
          const existing = state.items.find((item) => item.lineId === product.lineId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.lineId === product.lineId
                  ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...product, quantity: Math.min(99, Math.max(1, quantity)) },
            ],
          };
        }),
      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((item) => item.lineId !== lineId) })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) }
              : item,
          ),
        })),
      clear: () => set({ items: [], appliedVoucher: null }),
      clearCart: () => set({ items: [], appliedVoucher: null }),
      reset: () => set({ items: [], appliedVoucher: null }),
      applyVoucher: (voucher) => set({ appliedVoucher: voucher }),
      removeVoucher: () => set({ appliedVoucher: null }),
    }),
    {
      name: "cyber-mushroom-cart-storage",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<CartStoreState> | undefined;
        return {
          ...state,
          items: (state?.items ?? []).filter(
            (item): item is CartItem => Boolean(item.variantId && item.lineId),
          ),
        };
      },
    },
  ),
);
