import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product.types";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="min-w-0 border-t border-white/5 pt-6" aria-labelledby="related-products-title">
      <h2 id="related-products-title" className="mb-4 text-xs font-black uppercase tracking-widest text-text-pure">Cấu trúc gen tương đồng</h2>
      <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} viewMode="grid" showFavoriteButton={false} />)}
      </div>
    </section>
  );
}
