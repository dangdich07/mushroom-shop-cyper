import { create } from "zustand";

export type ToastType = "SUCCESS" | "ERROR" | "INFO";

export interface SystemToast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface OverlayState {
  toasts: SystemToast[];
  isGlobalLoading: boolean;
  // Các hành động tương tác (Actions)
  addToast: (toast: Omit<SystemToast, "id">) => void;
  dismissToast: (id: string) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  toasts: [],
  isGlobalLoading: false,

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const duration = toast.duration ?? 4000; // Mặc định hiển thị trong 4 giây

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, duration }],
    }));

    // Tự động giải phóng thông báo sau khi hết thời gian định lượng
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  dismissToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
}));