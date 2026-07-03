import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product.types";

interface WishlistStoreState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      // Thuật toán đảo trạng thái: Nếu đã có thì rút phôi (xóa), chưa có thì cấy phôi (thêm)
      toggleWishlist: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);

        if (exists) {
          set({ items: currentItems.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...currentItems, product] });
        }
      },

      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "cyber-mushroom-wishlist-storage", // Khóa bảo mật cục bộ tại LocalStorage chống mất dữ liệu khi F5
    }
  )
);