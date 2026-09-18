import type { AdminVoucher } from "@/features/admin/vouchers/admin-vouchers.types";
import { getVoucherDisplayStatus } from "@/features/admin/vouchers/admin-vouchers.repository";
import { AdminVoucherCard } from "./admin-voucher-card";

interface Props {
  vouchers: AdminVoucher[];
  today: string;
  pending: boolean;
  onDelete: (voucher: AdminVoucher) => void;
  onEdit: (voucher: AdminVoucher) => void;
}

export function AdminVoucherList({ vouchers, today, pending, onDelete, onEdit }: Props) {
  return <section aria-label="Danh sách voucher" className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">{vouchers.map((voucher) => <AdminVoucherCard key={voucher.code} voucher={voucher} status={getVoucherDisplayStatus(voucher, today)} pending={pending} onDelete={() => onDelete(voucher)} onEdit={() => onEdit(voucher)} />)}</section>;
}
