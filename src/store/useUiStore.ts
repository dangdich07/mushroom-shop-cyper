import { create } from "zustand";

interface UiState {
  isMiniCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isCommandMenuOpen: boolean; // Bổ sung
  currency: "VND" | "USDT";
  language: "VI" | "EN";
  toggleMiniCart: () => void;
  setMiniCartOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleCommandMenu: () => void; // Bổ sung
  setCommandMenuOpen: (open: boolean) => void; // Bổ sung
  setCurrency: (currency: "VND" | "USDT") => void;
  setLanguage: (language: "VI" | "EN") => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMiniCartOpen: false,
  isMobileMenuOpen: false,
  isCommandMenuOpen: false,
  currency: "VND",
  language: "VI",
  toggleMiniCart: () => set((state) => ({ isMiniCartOpen: !state.isMiniCartOpen })),
  setMiniCartOpen: (open) => set({ isMiniCartOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleCommandMenu: () => set((state) => ({ isCommandMenuOpen: !state.isCommandMenuOpen })),
  setCommandMenuOpen: (open) => set({ isCommandMenuOpen: open }),
  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
}));