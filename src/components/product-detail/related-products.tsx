"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import type { Product } from "@/types/product.types";

export function RelatedProducts({ products }: { products: Product[] }) {
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useOverlayStore((state) => state.addToast);

  if (products.length === 0) return null;

  const handleAdd = (product: Product) => {
    const variant = product.defaultVariant;
    const available = variant ? variant.stockQuantity - variant.reservedQuantity : 0;

    if (!variant || available <= 0) {
      addToast({
        title: "KHÔNG KHẢ DỤNG",
        description: "Sản phẩm này hiện chưa có biến thể còn hàng.",
        type: "ERROR",
      });
      return;
    }

    addItem({
      id: product.id,
      lineId: variant.id,
      variantId: variant.id,
      variantName: variant.name,
      name: product.name,
      price: variant.price,
      image: product.image,
      sku: variant.sku,
    }, 1);
    addToast({
      title: "GIỎ HÀNG",
      description: `Đã thêm ${product.name} vào giỏ.`,
      type: "SUCCESS",
    });
  };

  return (
    <section className="min-w-0 pb-8" aria-labelledby="related-products-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-primary-neon/15 pb-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary-neon">Có thể bạn quan tâm</p>
          <h2 id="related-products-title" className="mt-2 font-heading text-2xl font-bold text-text-pure sm:text-3xl">Sản phẩm liên quan</h2>
        </div>
        <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-control px-2 font-heading text-sm font-semibold text-primary-neon hover:text-primary-cyan focus-visible:bio-focus">
          Xem tất cả <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} list={false} onAdd={() => handleAdd(product)} />
        ))}
      </div>
    </section>
  );
}
