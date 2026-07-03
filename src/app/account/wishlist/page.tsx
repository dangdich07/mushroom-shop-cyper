"use client";

import React from "react";
import { useWishlistStore } from "@/store/useWishlistStore"; 
import { useOverlayStore } from "@/store/useOverlayStore";
import { ProductCard } from "@/components/product/product-card";
import { Trash2, HeartCrack } from "lucide-react";

export default function AccountWishlistPage() {
  const { addToast } = useOverlayStore();
  const wishlist = useWishlistStore();

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200 w-full">
      <h2 className="text-base font-heading font-black uppercase text-text-pure tracking-widest border-b border-white/5 pb-2">
        Danh mục lưu trữ phôi giống yêu thích
      </h2>
      
      {wishlist.items.length === 0 ? (
        <div className="w-full py-16 border border-dashed border-white/10 text-center bg-black/10 flex flex-col items-center justify-center gap-3">
          <HeartCrack className="w-8 h-8 text-text-dark opacity-40" />
          <p className="font-mono text-xs text-text-dark py-2 uppercase text-center max-w-sm leading-relaxed">
            Khay lưu trữ trống. Thả tim tại khay sản phẩm để cấy thêm bản ghi theo dõi sinh khối.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {wishlist.items.map((prod) => (
            <div key={prod.id} className="relative group border border-white/5 bg-black/5 hover:border-white/10 transition-all duration-200">
              
              {/* ĐÃ SỬA CHÍ MẠNG: Tắt hiển thị nút tim lượng tử nội bộ để tránh xung đột xếp chồng UI */}
              <ProductCard product={prod} viewMode="grid" showFavoriteButton={false} />
              
              {/* NÚT HÀNH ĐỘNG THANH LÝ NHANH BẢN GHI KHỎI VÙNG ĐỆM MÀU ĐỎ CỦA BẠN ĐƯỢC GIỮ VỮNG ĐỘC TÔN */}
              <button
                type="button"
                onClick={() => {
                  wishlist.toggleWishlist(prod);
                  addToast({ 
                    title: "LOẠI BỎ PHÔI", 
                    description: `Đã gỡ phôi nấm ${prod.name} khỏi khay ưu tiên thành công.`, 
                    type: "SUCCESS" 
                  });
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/80 border border-white/10 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-black transition-all z-20 cursor-pointer"
                title="Xóa nhanh bản ghi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}