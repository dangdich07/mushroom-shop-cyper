import type { AdminProduct } from "@/features/admin/products/admin-products.types";
import { AdminProductRow } from "./admin-product-row";

interface Props {
  products: AdminProduct[];
  pending: boolean;
  onDelete: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
  onToggle: (product: AdminProduct) => void;
  onInventory: (product: AdminProduct) => void;
}

export function AdminProductList({ products, pending, onDelete, onEdit, onToggle, onInventory }: Props) {
  return (
    <section aria-label="Danh sách sản phẩm" className="grid min-w-0 gap-3">
      {products.map((product) => (
        <AdminProductRow
          key={product.id}
          product={product}
          pending={pending}
          onDelete={() => onDelete(product)}
          onEdit={() => onEdit(product)}
          onToggle={() => onToggle(product)}
          onInventory={() => onInventory(product)}
        />
      ))}
    </section>
  );
}
