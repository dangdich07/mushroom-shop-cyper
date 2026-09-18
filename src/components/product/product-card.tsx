"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { formatVND } from "@/lib/utils";
import { Dna, ShoppingCart, Heart, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useWishlistStore } from "@/store/useWishlistStore"; 

interface ProductCardProps {
  product: Product;
  variant?: "default" | "home";
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
  variant = "default",
  viewMode = "grid",
  showFavoriteButton = true // Mặc định hiển thị toàn hệ thống
}) => {
  const { addToast } = useOverlayStore();
  const wishlist = useWishlistStore();
  const isFavorite = wishlist.isInWishlist(product.id);
  const cartStore = useCartStore() as unknown as ExpectedCartStoreState;
  const [homeImageFailed, setHomeImageFailed] = React.useState(false);

  React.useEffect(() => {
    setHomeImageFailed(false);
  }, [product.id, product.image]);

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

  if (variant === "home") {
    return (
      <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(9,30,48,0.96),rgba(4,18,31,0.98))] shadow-[0_14px_38px_rgba(0,0,0,0.22)] transition-[border-color,box-shadow,transform] duration-[var(--motion-duration-normal)] hover:border-cyan-300/50 hover:shadow-[0_18px_48px_rgba(0,0,0,0.32),0_0_28px_rgba(0,245,255,0.09)] motion-safe:hover:-translate-y-1 motion-reduce:transform-none">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[1.34] overflow-hidden border-b border-cyan-300/15 bg-[#061522]"
        >
          {product.image && !homeImageFailed ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setHomeImageFailed(true)}
              className="h-full w-full object-cover opacity-95 transition-transform duration-500 motion-safe:group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(0,245,255,0.2),transparent_28%),linear-gradient(145deg,#0b2940,#03101d)] text-cyan-300">
              <div className="flex flex-col items-center gap-3 rounded-full border border-primary-neon/20 bg-primary-neon/[0.05] p-7 shadow-[0_0_38px_rgba(0,245,255,0.08)]">
                <Dna className="h-9 w-9" aria-hidden="true" />
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-cyan-100/70">{product.category}</span>
              </div>
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#03101d]/70 via-transparent to-transparent" />
          {product.tags?.[0] && (
            <span className="absolute left-3 top-3 rounded-full border border-cyan-300/35 bg-[#03101d]/80 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
              {product.tags[0]}
            </span>
          )}
          {showFavoriteButton && (
            <button
              type="button"
              onClick={handleToggleHeart}
              aria-label={isFavorite ? `Xóa ${product.name} khỏi mục yêu thích` : `Thêm ${product.name} vào mục yêu thích`}
              aria-pressed={isFavorite}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#03101d]/75 text-[#f8fafc] backdrop-blur-sm transition-colors hover:border-primary-neon hover:text-primary-neon focus-visible:bio-focus"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary-neon text-primary-neon" : ""}`} aria-hidden="true" />
            </button>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-4 xl:p-[18px]">
          <Link href={`/products/${product.slug}`} className="focus-visible:bio-focus">
            <p className="truncate font-mono text-[8px] uppercase tracking-[0.16em] text-text-dark">
              SKU: {product.sku}
            </p>
            <h3 className="mt-1.5 line-clamp-2 min-h-11 font-heading text-[15px] font-bold leading-snug text-[#f8fafc] transition-colors group-hover:text-cyan-300">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] text-text-dark">
            <Star className="h-3.5 w-3.5 fill-status-warning text-status-warning" aria-hidden="true" />
            <span className="font-black text-text-muted">{product.rating.toFixed(1)}</span>
            <span>({product.totalReviews})</span>
          </div>

          <div className="mt-3 flex min-h-10 flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-primary-neon/10 pt-3 font-mono">
            <span className="text-base font-black text-[#f8fafc]">{formatVND(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <span className="text-[9px] text-text-dark line-through">{formatVND(product.compareAtPrice)}</span>
            ) : null}
          </div>

          <p className={`mt-1 flex items-center gap-2 font-mono text-[9px] font-bold uppercase ${product.inStock ? "text-status-success" : "text-status-danger"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {product.inStock ? "Còn hàng" : "Tạm hết hàng"}
          </p>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-cyan-300/75 bg-cyan-300/[0.05] px-3 font-heading text-xs font-bold text-cyan-300 transition-colors hover:bg-[#00e7f0] hover:text-[#03101d] focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            Thêm vào giỏ
          </button>
        </div>
      </article>
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
