import { Boxes, Edit2, Power, Trash2 } from "lucide-react";
import type { AdminProduct } from "@/features/admin/products/admin-products.types";
import { formatVND } from "@/lib/utils";
import { AdminProductImage } from "./admin-product-image";

interface Props {
  product: AdminProduct;
  pending: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onInventory: () => void;
}

export function AdminProductRow({ product, pending, onDelete, onEdit, onToggle, onInventory }: Props) {
  return (
    <article className="grid min-w-0 gap-3 border border-white/5 bg-background-card/15 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="flex min-w-0 gap-3">
        <AdminProductImage src={product.image} alt={product.name} />
        <div className="min-w-0">
          <p className="break-all font-mono text-[9px] font-bold uppercase tracking-wide text-text-dark">SKU: {product.sku}</p>
          <h2 className="break-words font-heading text-xs font-bold uppercase text-text-pure">{product.name}</h2>
          {product.scientificName && <p className="break-words text-[9px] italic text-primary-cyan">{product.scientificName}</p>}
          <div className="mt-1.5 flex min-w-0 flex-wrap gap-1.5">
            <span className="border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[8px] font-bold uppercase text-text-muted">{product.category}</span>
            <span className={`border px-2 py-0.5 font-mono text-[8px] font-bold uppercase ${product.variantsActive ? "border-primary-neon/20 text-primary-neon" : "border-amber-500/20 text-amber-400"}`}>{product.variantsActive ? "Đang hoạt động" : "Tạm ẩn"}</span>
            <span className="border border-white/10 px-2 py-0.5 font-mono text-[8px] uppercase text-text-dark">{product.variantCount} variant</span>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
        <strong className="mr-1 break-words font-mono text-sm text-text-pure">{formatVND(product.price)}</strong>
        <button type="button" onClick={onInventory} disabled={pending || product.variantCount === 0} aria-label={`Quản lý tồn kho ${product.name}`} className="inline-flex min-h-10 items-center justify-center gap-2 border border-primary-cyan/30 px-3 font-mono text-[9px] font-bold uppercase text-primary-cyan hover:bg-primary-cyan/10 focus-visible:bio-focus disabled:opacity-40"><Boxes aria-hidden="true" className="h-4 w-4" /><span className="hidden xl:inline">Tồn kho</span></button>
        <button type="button" onClick={onToggle} disabled={pending || product.variantCount === 0} aria-label={`${product.variantsActive ? "Tạm ẩn" : "Kích hoạt"} các variant của ${product.name}`} aria-pressed={product.variantsActive} className="inline-flex min-h-10 min-w-10 items-center justify-center border border-white/10 text-text-dark hover:border-primary-neon hover:text-primary-neon focus-visible:bio-focus disabled:opacity-40"><Power aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" onClick={onEdit} disabled={pending} aria-label={`Sửa ${product.name}`} className="inline-flex min-h-10 min-w-10 items-center justify-center border border-white/10 text-text-dark hover:border-primary-cyan hover:text-primary-cyan focus-visible:bio-focus disabled:opacity-40"><Edit2 aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" onClick={onDelete} disabled={pending} aria-label={`Xóa ${product.name}`} className="inline-flex min-h-10 min-w-10 items-center justify-center border border-white/10 text-text-dark hover:border-red-500 hover:text-red-400 focus-visible:bio-focus disabled:opacity-40"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </article>
  );
}
