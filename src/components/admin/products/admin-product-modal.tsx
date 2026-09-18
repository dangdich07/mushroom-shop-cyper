import type { FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import type { AdminProductFormData } from "@/features/admin/products/admin-products.types";
import { AdminProductForm } from "./admin-product-form";

interface Props { creating: boolean; data: AdminProductFormData; open: boolean; pending: boolean; onChange: (data: AdminProductFormData) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }
export function AdminProductModal({ creating, data, open, pending, onChange, onClose, onSubmit }: Props) {
  return <Modal isOpen={open} onClose={onClose} title={creating ? "Tạo sản phẩm" : "Cập nhật sản phẩm"}><AdminProductForm creating={creating} data={data} pending={pending} onChange={onChange} onCancel={onClose} onSubmit={onSubmit} /></Modal>;
}
