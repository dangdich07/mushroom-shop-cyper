import type { FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import type { AdminVoucherFormData } from "@/features/admin/vouchers/admin-vouchers.types";
import { AdminVoucherForm } from "./admin-voucher-form";

interface Props {
  data: AdminVoucherFormData;
  editing: boolean;
  open: boolean;
  pending: boolean;
  onChange: (data: AdminVoucherFormData) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminVoucherModal({ data, editing, open, pending, onChange, onClose, onSubmit }: Props) {
  return <Modal isOpen={open} onClose={onClose} title={editing ? `Cập nhật voucher ${data.code}` : "Tạo voucher mới"}><AdminVoucherForm data={data} editing={editing} pending={pending} onChange={onChange} onCancel={onClose} onSubmit={onSubmit} /></Modal>;
}
