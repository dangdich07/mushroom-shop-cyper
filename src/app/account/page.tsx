"use client";

import { useQuery } from "@tanstack/react-query";
import { AccountPageHeader } from "@/components/account/account-page-header";
import { AccountStatePanel } from "@/components/account/account-state-panel";
import { AccountStatGrid } from "@/components/account/account-stat-grid";
import { getAccountDashboard } from "@/features/account/account.repository";
import { formatVND } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

export default function AccountDashboardPage() {
  const dashboardQuery = useQuery({ queryKey: ["account-dashboard"], queryFn: () => getAccountDashboard(supabase) });
  if (dashboardQuery.isLoading) return <AccountStatePanel kind="LOADING" message="Đang cập nhật dữ liệu tài khoản..." />;
  if (dashboardQuery.isError) return <div className="space-y-3"><AccountStatePanel kind="ERROR" message="Không thể tải dữ liệu tổng quan lúc này." /><button type="button" onClick={() => dashboardQuery.refetch()} className="min-h-11 border border-primary-cyan/30 px-4 font-mono text-xs uppercase text-primary-cyan">Thử lại</button></div>;

  const dashboard = dashboardQuery.data;
  if (!dashboard) return <AccountStatePanel kind="EMPTY" message="Chưa có dữ liệu tổng quan." />;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 animate-in fade-in duration-200 motion-reduce:animate-none">
      <AccountPageHeader title="Trung Tâm Điều Phối Cá Nhân" description="Tổng quan dữ liệu tài khoản hiện tại." />
      <AccountStatGrid items={[
        { label: "Tổng Đơn Hàng", value: String(dashboard.orders.length) },
        { label: "Điểm Tích Lũy", value: `${dashboard.loyaltyPoints} Pts`, tone: "PURPLE" },
        { label: "Tổng Quyết Toán", value: formatVND(dashboard.totalSpent), tone: "CYAN" },
        { label: "Đơn Đã Giao", value: String(dashboard.orders.filter((order) => order.status.toUpperCase() === "DELIVERED").length), tone: "NEON" },
      ]} />
      <section className="mt-2 flex min-w-0 flex-col gap-3">
        <h2 className="border-b border-white/5 pb-2 font-heading text-xs font-black uppercase tracking-widest text-primary-cyan">Hoạt động gần đây</h2>
        {dashboard.orders.length === 0 ? <AccountStatePanel kind="EMPTY" message="Chưa có hoạt động đơn hàng gần đây." /> : <ul className="grid gap-2 font-mono text-xs">{dashboard.orders.slice(0, 3).map((order) => <li key={order.id} className="min-w-0 border border-white/5 bg-white/2 p-3"><span className="break-words text-text-pure">Đơn hàng <span className="break-all text-primary-cyan">{order.id}</span> — {order.status}</span><time className="mt-1 block text-[10px] text-text-dark">{order.createdAt}</time></li>)}</ul>}
      </section>
    </div>
  );
}
