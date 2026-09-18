"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatePanel } from "@/components/admin/admin-state-panel";
import { AdminVoucherList } from "@/components/admin/vouchers/admin-voucher-list";
import { AdminVoucherModal } from "@/components/admin/vouchers/admin-voucher-modal";
import { AdminVouchersToolbar } from "@/components/admin/vouchers/admin-vouchers-toolbar";
import { getAdminVouchers, getVoucherDisplayStatus } from "@/features/admin/vouchers/admin-vouchers.repository";
import type { AdminVoucher, AdminVoucherFormData, VoucherActionPayload, VoucherStatusFilter } from "@/features/admin/vouchers/admin-vouchers.types";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { deleteVoucherAdminAction, saveVoucherAdminAction } from "./actions";

const EMPTY_FORM: AdminVoucherFormData = {
  code: "",
  discountType: "PERCENT",
  discountValue: 0,
  minSubtotal: 0,
  description: "",
  expiryDate: "2026-12-31",
};

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toForm(voucher: AdminVoucher): AdminVoucherFormData {
  return {
    code: voucher.code,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minSubtotal: voucher.minSubtotal,
    description: voucher.description,
    expiryDate: voucher.expiryDate,
  };
}

export default function AdminVouchersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VoucherStatusFilter>("ALL");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<AdminVoucherFormData>(EMPTY_FORM);
  const today = localDateKey();

  const vouchersQuery = useQuery({
    queryKey: ["admin-all-vouchers"],
    queryFn: () => getAdminVouchers(supabase),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (formData.discountType === "PERCENT" && formData.discountValue > 100) {
        throw new Error("Hàm lượng chiết khấu phần trăm không được vượt ngưỡng 100%");
      }
      const payload: VoucherActionPayload = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        min_subtotal: formData.minSubtotal,
        description: formData.description.trim(),
        expiry_date: formData.expiryDate,
      };
      const result = await saveVoucherAdminAction(payload, editingCode);
      if (!result.success) throw new Error(result.error ?? "Không thể lưu voucher.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-vouchers"] });
      addToast({ title: "XÁC LẬP THÀNH CÔNG", description: editingCode ? "Đã cập nhật biến động phễu ưu đãi." : "Đã kích hoạt phôi voucher mới lên trục màng đám mây.", type: "SUCCESS" });
      setModalOpen(false);
      setEditingCode(null);
    },
    onError: (error: Error) => addToast({ title: "BÁO ĐỘNG LOGIC", description: error.message, type: "ERROR" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (code: string) => {
      const result = await deleteVoucherAdminAction(code);
      if (!result.success) throw new Error(result.error ?? "Không thể xóa voucher.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-vouchers"] });
      addToast({ title: "THANH TRỪNG THÀNH CÔNG", description: "Mã ưu đãi đã bị xóa sổ vĩnh viễn khỏi trục lưu trữ.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "THAO TÁC THẤT BẠI", description: error.message, type: "ERROR" }),
  });

  const vouchers = useMemo(() => vouchersQuery.data ?? [], [vouchersQuery.data]);
  const displayVouchers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const matchesSearch = !query || voucher.code.toLowerCase().includes(query) || voucher.description.toLowerCase().includes(query);
      const matchesStatus = status === "ALL" || getVoucherDisplayStatus(voucher, today) === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, today, vouchers]);
  const pending = saveMutation.isPending || deleteMutation.isPending;

  function openCreate() {
    setEditingCode(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  }
  function openEdit(voucher: AdminVoucher) {
    setEditingCode(voucher.code);
    setFormData(toForm(voucher));
    setModalOpen(true);
  }
  const closeModal = useCallback(() => {
    if (!saveMutation.isPending) {
      setModalOpen(false);
      setEditingCode(null);
    }
  }, [saveMutation.isPending]);
  function requestDelete(voucher: AdminVoucher) {
    if (window.confirm(`Xác nhận xóa bỏ vĩnh viễn voucher [${voucher.code}]?`)) deleteMutation.mutate(voucher.code);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saveMutation.isPending) saveMutation.mutate();
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <AdminPageHeader title="Quản trị voucher" description="Quản lý giá trị giảm, ngưỡng đơn tối thiểu và thời hạn sử dụng" />
      <AdminVouchersToolbar count={displayVouchers.length} search={search} status={status} onCreate={openCreate} onSearchChange={setSearch} onStatusChange={setStatus} />
      {vouchersQuery.isLoading ? (
        <AdminStatePanel kind="LOADING" message="Đang tải danh sách voucher..." />
      ) : vouchersQuery.isError ? (
        <AdminStatePanel kind="ERROR" message="Không thể tải danh sách voucher lúc này." action={<button type="button" onClick={() => vouchersQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} />
      ) : displayVouchers.length === 0 ? (
        <AdminStatePanel kind="EMPTY" message="Không tìm thấy voucher phù hợp." />
      ) : (
        <AdminVoucherList vouchers={displayVouchers} today={today} pending={pending} onEdit={openEdit} onDelete={requestDelete} />
      )}
      <AdminVoucherModal data={formData} editing={Boolean(editingCode)} open={modalOpen} pending={saveMutation.isPending} onChange={setFormData} onClose={closeModal} onSubmit={submit} />
    </div>
  );
}
