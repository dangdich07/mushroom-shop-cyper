import { create } from "zustand";
import { persist } from "zustand/middleware"; 
import { Voucher } from "@/services/mockDb"; // Cấy liên thông kiểu dữ liệu Voucher chuẩn y khoa

// 1. Định nghĩa cấu trúc vật phẩm nấm trong giỏ hàng
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
}

// 2. Định nghĩa các phương thức tương tác của kho giỏ hàng
interface CartStoreState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  clearCart: () => void;
  reset: () => void;
  
  // BỔ SUNG TRƯỜNG QUAN TRỌNG: Quản trị trạng thái Ưu đãi liên thông
  appliedVoucher: Voucher | null;
  applyVoucher: (voucher: Voucher) => void;
  removeVoucher: () => void;
}

// 3. Khởi tạo trục Zustand Store bảo mật kiểu dữ liệu
export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      appliedVoucher: null, // Khởi tạo màng đệm rỗng

      // Phân hệ thêm sinh khối nấm vào giỏ
      addItem: (product, quantity) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity }] };
        }),

      // Phân hệ loại bỏ vật phẩm khỏi khay nghiệm thu
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      // Cập nhật số lượng thủ công tại trang /cart
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      // ==========================================================
      // GIẢI PHÁP ĐÓNG ĐINH LUỒNG XOÁ SẠCH: Gán thẳng items về mảng rỗng [] và hủy voucher
      // ==========================================================
      clear: () => set({ items: [], appliedVoucher: null }),
      clearCart: () => set({ items: [], appliedVoucher: null }),
      reset: () => set({ items: [], appliedVoucher: null }),

      // BIỂU THỨC THAY ĐỔI TRẠNG THÁI VOUCHER THỰC CHIẾT
      applyVoucher: (voucher) => set({ appliedVoucher: voucher }),
      removeVoucher: () => set({ appliedVoucher: null }),
    }),
    {
      name: "cyber-mushroom-cart-storage", // Khóa lưu đệm an toàn tại LocalStorage
    }
  )
);