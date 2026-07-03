"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { formatVND } from "@/lib/utils";
import { ShoppingCart, Heart } from "lucide-react"; 
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useWishlistStore } from "@/store/useWishlistStore"; 

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  showFavoriteButton?: boolean; // ĐÃ THÊM: Cờ hiệu điều khiển chống trùng lặp nút bấm trên UI
}

interface ExpectedCartStoreState {
  items: unknown[];
  add?: (product: Product, quantity: number) => void;
  addItem?: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = "grid",
  showFavoriteButton = true // Mặc định hiển thị toàn hệ thống
}) => {
  const { addToast } = useOverlayStore();
  const wishlist = useWishlistStore();
  const isFavorite = wishlist.isInWishlist(product.id);
  const cartStore = useCartStore() as unknown as ExpectedCartStoreState;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    const addFn = cartStore.add || cartStore.addItem;
    if (addFn) {
      addFn(product, 1);
      addToast({ title: "GIỎ HÀNG", description: `Đã nạp hỏa tốc ${product.name} vào giỏ.`, type: "SUCCESS" });
    }
  };

  const handleToggleHeart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    wishlist.toggleWishlist(product);
    
    addToast({
      title: isFavorite ? "THU HỒI PHÔI" : "CẤY GHÉP GIỐNG",
      description: isFavorite 
        ? `Đã gỡ ${product.name} khỏi danh mục theo dõi.` 
        : `Đã đưa chuỗi sinh khối ${product.name} vào kho lưu trữ yêu thích trường tồn.`,
      type: "SUCCESS"
    });
  };

  if (viewMode === "list") {
    return (
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-6 border border-white/5 hover:border-primary-neon/30 transition-all group relative">
        <Link href={`/products/${product.slug}`} className="w-full sm:w-40 aspect-square shrink-0 overflow-hidden bg-background-dark border border-white/5 block relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
          
          {/* SỬA ĐỔI: Chỉ render nút tim khi được cấp phép */}
          {showFavoriteButton && (
            <button
              type="button"
              onClick={handleToggleHeart}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 border border-white/10 flex items-center justify-center text-text-pure hover:border-primary-neon transition-all z-20 cursor-pointer group/heart"
              title={isFavorite ? "Xóa khỏi mục yêu thích" : "Thêm vào mục yêu thích"}
            >
              <Heart 
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  isFavorite 
                    ? "fill-primary-neon text-primary-neon drop-shadow-[0_0_6px_#00FF66]" 
                    : "text-text-dark group-hover/heart:text-text-pure"
                }`} 
              />
            </button>
          )}
        </Link>
        <div className="flex-grow flex flex-col gap-2 pt-2">
          <Link href={`/products/${product.slug}`} className="block group-hover:text-primary-neon transition-colors">
            <span className="font-mono text-[10px] text-primary-cyan uppercase tracking-widest">{product.sku}</span>
            <h3 className="font-heading font-bold text-base text-text-pure uppercase tracking-wide mt-0.5 line-clamp-1">{product.name}</h3>
          </Link>
          <p className="text-xs text-text-dark font-body line-clamp-2 max-w-xl">{product.shortDescription}</p>
          <div className="mt-auto pt-4 flex items-center justify-between font-mono">
            <span className="text-text-pure font-black text-base">{formatVND(product.price)}</span>
            <button onClick={handleQuickAdd} className="h-9 bg-white/5 border border-white/10 text-text-pure px-4 hover:bg-primary-neon hover:text-background-deep transition-all flex items-center gap-2 uppercase font-bold text-[10px] tracking-wider cursor-pointer">
              <ShoppingCart className="w-3.5 h-3.5" /> Nạp nhanh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col border border-white/5 hover:border-primary-neon/30 transition-all group relative overflow-hidden">
      <Link href={`/products/${product.slug}`} className="w-full aspect-square bg-background-dark overflow-hidden relative border-b border-white/5 block">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
        {product.tags?.[0] && (
          <div className="absolute top-3 left-3 bg-primary-neon text-background-deep font-mono font-black text-[9px] px-2 py-0.5 uppercase tracking-wider">
            {product.tags[0]}
          </div>
        )}
        
        {/* SỬA ĐỔI: Chỉ render nút tim khi được cấp phép */}
        {showFavoriteButton && (
          <button
            type="button"
            onClick={handleToggleHeart}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 border border-white/10 flex items-center justify-center text-text-pure hover:border-primary-neon transition-all z-20 cursor-pointer group/heart"
            title={isFavorite ? "Xóa khỏi mục yêu thích" : "Thêm vào mục yêu thích"}
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isFavorite 
                  ? "fill-primary-neon text-primary-neon drop-shadow-[0_0_6px_#00FF66]" 
                  : "text-text-dark group-hover/heart:text-text-pure"
              }`} 
            />
          </button>
        )}
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <Link href={`/products/${product.slug}`} className="block flex-grow group-hover:text-primary-neon transition-colors">
          <span className="font-mono text-[9px] text-text-dark uppercase tracking-wider block">{product.scientificName || "Cyber F1 Gen"}</span>
          <h3 className="font-heading font-bold text-xs uppercase tracking-wide text-text-pure line-clamp-2 mt-0.5 min-h-[32px]">{product.name}</h3>
        </Link>
        <div className="flex justify-between items-center font-mono text-xs pt-2 border-t border-white/5 mt-auto">
          <span className="text-text-pure font-black text-sm">{formatVND(product.price)}</span>
          <button onClick={handleQuickAdd} className="w-8 h-8 bg-white/5 border border-white/10 text-text-pure flex items-center justify-center hover:bg-primary-neon hover:text-background-deep hover:border-primary-neon transition-all cursor-pointer" title="Nạp hỏa tốc 1 khối">
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};