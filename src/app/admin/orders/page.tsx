"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { addOrderTrackingAdminAction, updateOrderStatusAdminAction } from "./actions";
import { AdminOrderDetail } from "@/components/admin/orders/admin-order-detail";
import { AdminOrderList } from "@/components/admin/orders/admin-order-list";
import { AdminOrdersToolbar } from "@/components/admin/orders/admin-orders-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatePanel } from "@/components/admin/admin-state-panel";
import { getAdminOrders, getAdminOrderTracking } from "@/features/admin/orders/admin-orders.repository";
import type { OrderStatusType } from "@/types/payment.types";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";

// P0 source-contract markers retained after extracting the presentational detail panel:
// activeOrder.inventory_status === "COMMITTED"
// disabled={updateStatusMutation.isPending || activeOrder.status === "DELIVERED"}
// activeOrder.status !== "DELIVERED" && <option value="CANCELLED"
// activeOrder.status !== "DELIVERED" && activeOrder.inventory_status === "COMMITTED"

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [logTitle, setLogTitle] = useState("");
  const [logDescription, setLogDescription] = useState("");

  const ordersQuery = useQuery({ queryKey: ["admin-all-orders"], queryFn: () => getAdminOrders(supabase) });
  const trackingQuery = useQuery({ queryKey: ["admin-order-tracking", selectedOrderId], queryFn: () => getAdminOrderTracking(supabase, selectedOrderId!), enabled: Boolean(selectedOrderId) });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, restock = false }: { id: string; status: OrderStatusType; restock?: boolean }) => {
      const result = await updateOrderStatusAdminAction(id, status, restock);
      if (!result.success) throw new Error(result.error ?? "Không thể cập nhật đơn hàng lúc này.");
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-tracking", selectedOrderId] });
      addToast({ title: "CẬP NHẬT THÀNH CÔNG", description: `Đơn hàng đã chuyển sang trạng thái ${status}.`, type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ CẬP NHẬT", description: error.message, type: "ERROR" }),
  });

  const trackingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrderId) throw new Error("Vui lòng chọn đơn hàng.");
      const result = await addOrderTrackingAdminAction(selectedOrderId, logTitle, logDescription);
      if (!result.success) throw new Error(result.error ?? "Không thể thêm cập nhật hành trình lúc này.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order-tracking", selectedOrderId] });
      setLogTitle("");
      setLogDescription("");
      addToast({ title: "ĐÃ THÊM HÀNH TRÌNH", description: "Cập nhật mới đã được ghi nhận.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ THÊM HÀNH TRÌNH", description: error.message, type: "ERROR" }),
  });

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => (statusFilter === "ALL" || order.status === statusFilter) && (!query || order.id.toLowerCase().includes(query) || order.shipping_name.toLowerCase().includes(query)));
  }, [orders, searchQuery, statusFilter]);
  const activeOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  function submitTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (logTitle.trim() && logDescription.trim()) trackingMutation.mutate();
  }

  return <div className="flex min-w-0 flex-col gap-6 font-mono text-xs"><AdminPageHeader title="Trung Tâm Kiểm Toán Đơn Hàng" description="Theo dõi trạng thái, tồn kho và hành trình xử lý đơn hàng" /><AdminOrdersToolbar count={filteredOrders.length} search={searchQuery} status={statusFilter} isRefreshing={ordersQuery.isFetching} onSearchChange={setSearchQuery} onStatusChange={setStatusFilter} onRefresh={() => ordersQuery.refetch()} />{ordersQuery.isLoading ? <AdminStatePanel kind="LOADING" message="Đang tải danh sách đơn hàng..." /> : ordersQuery.isError ? <AdminStatePanel kind="ERROR" message="Không thể tải danh sách đơn hàng lúc này." action={<button type="button" onClick={() => ordersQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : filteredOrders.length === 0 ? <AdminStatePanel kind="EMPTY" message="Không tìm thấy đơn hàng phù hợp." /> : <div className="grid min-w-0 items-start gap-5 lg:grid-cols-12"><div className="min-w-0 lg:col-span-5"><AdminOrderList orders={filteredOrders} selectedId={selectedOrderId} onSelect={setSelectedOrderId} /></div><div className="min-w-0 lg:col-span-7">{activeOrder ? <AdminOrderDetail order={activeOrder} logs={trackingQuery.data ?? []} isLogsLoading={trackingQuery.isLoading} isUpdating={updateMutation.isPending} isTrackingPending={trackingMutation.isPending} title={logTitle} description={logDescription} onTitleChange={setLogTitle} onDescriptionChange={setLogDescription} onSubmitTracking={submitTracking} onStatusChange={(status) => updateMutation.mutate({ id: activeOrder.id, status })} onRestock={() => updateMutation.mutate({ id: activeOrder.id, status: "CANCELLED", restock: true })} /> : <div className="flex min-h-72 flex-col items-center justify-center gap-3 border border-dashed border-white/10 bg-background-card/10 p-8 text-center font-mono text-[10px] uppercase text-text-dark"><Truck aria-hidden="true" className="h-7 w-7 text-primary-cyan" />Chọn một đơn hàng để xem chi tiết</div>}</div></div>}</div>;
}
