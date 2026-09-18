"use client";

import { useQuery } from "@tanstack/react-query";
import { AccountOrderList } from "@/components/account/account-order-list";
import { AccountPageHeader } from "@/components/account/account-page-header";
import { AccountStatePanel } from "@/components/account/account-state-panel";
import { getAccountOrders } from "@/features/account/account.repository";
import { supabase } from "@/lib/supabaseClient";

export default function AccountOrdersPage() {
  const ordersQuery = useQuery({ queryKey: ["account-orders"], queryFn: () => getAccountOrders(supabase) });

  if (ordersQuery.isLoading) return <AccountStatePanel kind="LOADING" message="Đang truy xuất hồ sơ giao dịch..." />;
  if (ordersQuery.isError) return <div className="space-y-3"><AccountStatePanel kind="ERROR" message="Không thể tải lịch sử đơn hàng lúc này." /><button type="button" onClick={() => ordersQuery.refetch()} className="min-h-11 border border-primary-cyan/30 px-4 font-mono text-xs uppercase text-primary-cyan">Thử lại</button></div>;

  const orders = ordersQuery.data ?? [];
  return (
    <div className="flex w-full min-w-0 flex-col gap-5 animate-in fade-in duration-200 motion-reduce:animate-none">
      <AccountPageHeader eyebrow="Hồ sơ giao dịch" title="Nhật ký kiểm toán giao dịch" />
      {orders.length === 0 ? <AccountStatePanel kind="EMPTY" message="Chưa phát sinh bản ghi vận đơn nào." /> : <AccountOrderList orders={orders.map((order) => ({ id: order.id, timeStamp: order.createdAt, status: order.status, amount: order.grandTotal, trackingHref: `/track-order?id=${order.id}` }))} />}
    </div>
  );
}
