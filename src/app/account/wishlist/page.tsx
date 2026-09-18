"use client";

import React from "react";
import { useWishlistStore } from "@/store/useWishlistStore"; 
import { useOverlayStore } from "@/store/useOverlayStore";
import { AccountSectionToolbar } from "@/components/account/account-section-toolbar";
import { AccountWishlistGrid } from "@/components/account/account-wishlist-grid";

export default function AccountWishlistPage() {
  const { addToast } = useOverlayStore();
  const wishlist = useWishlistStore();

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <AccountSectionToolbar title="Danh mục lưu trữ phôi giống yêu thích" />
      <AccountWishlistGrid
        products={wishlist.items}
        onRemove={(product) => {
          wishlist.toggleWishlist(product);
          addToast({ title: "LOẠI BỎ PHÔI", description: `Đã gỡ phôi nấm ${product.name} khỏi khay ưu tiên thành công.`, type: "SUCCESS" });
        }}
      />
    </div>
  );
}
