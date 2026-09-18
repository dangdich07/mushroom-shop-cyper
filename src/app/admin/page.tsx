"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Layers, TrendingUp, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRecentOrders } from "@/components/admin/admin-recent-orders";
import { AdminStatePanel } from "@/components/admin/admin-state-panel";
import { AdminStatGrid } from "@/components/admin/admin-stat-grid";
import { getAdminDashboard } from "@/features/admin/admin.repository";
import { formatVND } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => getAdminDashboard(supabase),
    refetchInterval: 30000,
  });

  if (dashboardQuery.isLoading) return <AdminStatePanel kind="LOADING" message="Đang truy quét ma trận chỉ số vận hành toàn sàn..." />;
  if (dashboardQuery.isError) return <AdminStatePanel kind="ERROR" message="Không thể tải dữ liệu tổng quan quản trị lúc này." action={<button type="button" onClick={() => dashboardQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} />;
  if (!dashboardQuery.data) return <AdminStatePanel kind="EMPTY" message="Chưa có dữ liệu tổng quan quản trị." />;

  const stats = dashboardQuery.data;
  return <div className="flex min-w-0 flex-col gap-8 animate-in fade-in duration-300 motion-reduce:animate-none"><AdminPageHeader title="Tổng Quan Hệ Sinh Thái" description="Kiểm toán năng suất tài chính và logs xử lý chuỗi sinh khối" /><AdminStatGrid items={[
    { label: "Doanh Thu Quyết Toán", value: formatVND(stats.totalRevenue), icon: TrendingUp, tone: "CYAN" },
    { label: "Khối Lượng Vận Đơn", value: `${stats.totalOrders} Đơn Hàng`, icon: Layers, tone: "NEON" },
    { label: "Kỹ Sư Hệ Thống", value: `${stats.totalUsers} Phôi Định Danh`, icon: Users, tone: "CYAN" },
    { label: "Mô Nấm Khai Thác", value: `${stats.totalProducts} Chủng Loại`, icon: CheckCircle2, tone: "NEON" },
  ]} /><AdminRecentOrders orders={stats.recentOrders} /></div>;
}
