import { HeartCrack, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product.types";

interface AccountWishlistGridProps { products: Product[]; onRemove: (product: Product) => void; }

export function AccountWishlistGrid({ products, onRemove }: AccountWishlistGridProps) {
  if (products.length === 0) return <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 border border-dashed border-white/10 bg-black/10 p-6 text-center"><HeartCrack aria-hidden="true" className="h-8 w-8 text-text-dark opacity-40" /><p className="max-w-sm font-mono text-xs uppercase leading-relaxed text-text-dark">Khay lưu trữ trống. Thả tim tại sản phẩm để thêm bản ghi theo dõi.</p></div>;
  return <ul className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <li key={product.id} className="group relative min-w-0 border border-white/5 bg-black/5"><ProductCard product={product} viewMode="grid" showFavoriteButton={false} /><button type="button" onClick={() => onRemove(product)} aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`} className="absolute right-2 top-2 z-20 inline-flex min-h-11 min-w-11 items-center justify-center border border-white/10 bg-black/90 text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"><Trash2 aria-hidden="true" className="h-4 w-4" /></button></li>)}</ul>;
}
