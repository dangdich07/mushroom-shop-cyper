"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/utils";
import { 
  TrendingUp, Layers, Users,
  Activity, AlertTriangle, ArrowUpRight, CheckCircle2, Clock 
} from "lucide-react";
import Link from "next/link";

// Khai báo giao diện kiểu dữ liệu kiểm toán nội bộ
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    shipping_name: string;
    grand_total: number;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  // TRUY QUÉT MA TRẬN CHỈ SỐ SONG SONG TỪ HỆ CƠ SỞ DỮ LIỆU THẬT
  const { data: stats, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: async () => {
      const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
      
      // Khung phôi dữ liệu fallback khi môi trường cục bộ chưa thông mạch Cloud
      let totalRevenue = 2345000;
      let totalOrders = 12;
      let totalUsers = 4;
      let totalProducts = 3;
      let recentOrders: DashboardStats["recentOrders"] = [
        { id: "ORD-92841A", shipping_name: "NÔNG ĐẶNG ĐÍCH", grand_total: 1250000, status: "PENDING", created_at: new Date().toISOString() },
        { id: "ORD-83214B", shipping_name: "TRẦN MẠNH QUÂN", grand_total: 850000, status: "DELIVERED", created_at: new Date().toISOString() }
      ];

      if (dataSource === "SUPABASE") {
        // 1. Quét tổng doanh thu và số lượng đơn hàng
        const { data: dbOrders, error: errOrders } = await supabase
          .from("orders")
          .select("id, grand_total, status, shipping_name, created_at")
          .order("created_at", { ascending: false });

        if (!errOrders && dbOrders) {
          totalOrders = dbOrders.length;
          totalRevenue = dbOrders
            .filter(o => o.status !== "CANCELLED")
            .reduce((acc, curr) => acc + Number(curr.grand_total), 0);
          
          recentOrders = dbOrders.slice(0, 5).map(o => ({
            id: o.id,
            shipping_name: o.shipping_name,
            grand_total: Number(o.grand_total),
            status: o.status,
            created_at: o.created_at
          }));
        }

        // 2. Quét tổng số lượng nhân sự phòng Lab (profiles)
        const { count: userCount, error: errUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        
        if (!errUsers && userCount !== null) {
          totalUsers = userCount;
        }

        // 3. Quét tổng số chủng loại mô nấm đang lưu kho (products)
        const { count: productCount, error: errProducts } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        if (!errProducts && productCount !== null) {
          totalProducts = productCount;
        }
      }

      return { totalRevenue, totalOrders, totalUsers, totalProducts, recentOrders };
    },
    refetchInterval: 30000, // Tự động tái quét chu kỳ xung nhịp mỗi 30 giây (Realtime Polling Pulse)
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "PROCESSING":
        return "bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20";
      case "SHIPPED":
      case "DELIVERED":
        return "bg-primary-neon/10 text-primary-neon border-primary-neon/20";
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="font-mono text-xs text-primary-cyan flex items-center justify-center py-20 bg-black/10 border border-white/5">
        <Activity className="w-4 h-4 animate-spin mr-2" /> ĐANG TRUY QUÉT MA TRẬN CHỈ SỐ VẬN HÀNH TOÀN SÀN...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 font-mono text-xs text-red-400 w-full">
        <AlertTriangle className="w-4 h-4" /> XUNG ĐỘT TRỤC DỮ LIỆU ĐẦU NÃO: {error instanceof Error ? error.message : "Cổng nghẽn."}
      </div>
    );
  }

  const metrics = stats || { totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0, recentOrders: [] };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 w-full">
      {/* TIÊU ĐỀ LỚP TRÊN KHÔNG GIAN SÀN */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-heading font-black uppercase text-text-pure tracking-wider">TỔNG QUAN HỆ SINH THÁI</h1>
        <p className="text-[10px] font-mono text-text-dark uppercase tracking-widest">Kiểm toán năng suất tài chính và logs xử lý chuỗi sinh khối</p>
      </div>

      {/* MA TRẬN 4 KHỐI CHỈ SỐ GLOWING CYBER-CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        
        {/* CARD 1: DOANH THU QUYẾT TOÁN */}
        <div className="glass-card p-5 border-white/5 bg-background-card/20 flex items-center justify-between group hover:border-primary-cyan/40 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-text-dark uppercase tracking-wider">Doanh Thu Quyết Toán</span>
            <span className="text-xl font-mono font-black text-text-pure tracking-tight">{formatVND(metrics.totalRevenue)}</span>
          </div>
          <div className="w-10 h-10 border border-primary-cyan/20 bg-primary-cyan/5 flex items-center justify-center text-primary-cyan shadow-[0_0_8px_rgba(0,245,255,0.05)] rounded-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* CARD 2: TỔNG VẬN ĐƠN KHỞI TẠO */}
        <div className="glass-card p-5 border-white/5 bg-background-card/20 flex items-center justify-between group hover:border-primary-neon/40 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-text-dark uppercase tracking-wider">Khối Lượng Vận Đơn</span>
            <span className="text-xl font-mono font-black text-text-pure tracking-tight">{metrics.totalOrders} ĐƠN HÀNG</span>
          </div>
          <div className="w-10 h-10 border border-primary-neon/20 bg-primary-neon/5 flex items-center justify-center text-primary-neon shadow-[0_0_8px_rgba(0,255,102,0.05)] rounded-sm">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* CARD 3: NHÂN SỰ PHÒNG LAB */}
        <div className="glass-card p-5 border-white/5 bg-background-card/20 flex items-center justify-between group hover:border-primary-cyan/40 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-text-dark uppercase tracking-wider">Kỹ Sư Hệ Thống</span>
            <span className="text-xl font-mono font-black text-text-pure tracking-tight">{metrics.totalUsers} PHÔI ĐỊNH DANH</span>
          </div>
          <div className="w-10 h-10 border border-primary-cyan/20 bg-primary-cyan/5 flex items-center justify-center text-primary-cyan rounded-sm">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* CARD 4: CHỦNG LOẠI MÔ NẤM KHAI THÁC */}
        <div className="glass-card p-5 border-white/5 bg-background-card/20 flex items-center justify-between group hover:border-primary-neon/40 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-text-dark uppercase tracking-wider">Mô Nấm Khai Thác</span>
            <span className="text-xl font-mono font-black text-text-pure tracking-tight">{metrics.totalProducts} CHỦNG LOẠI</span>
          </div>
          <div className="w-10 h-10 border border-primary-neon/20 bg-primary-neon/5 flex items-center justify-center text-primary-neon rounded-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* LƯỚI ĐIỀU ĐỘNG LOGS VẬN ĐƠN MỚI CẬP BẾN */}
      <div className="glass-premium p-6 border-white/5 w-full">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-text-pure flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-cyan" /> Xung tín hiệu vận đơn mới cập bến
          </h3>
          <Link href="/admin/orders" className="font-mono text-[10px] text-text-dark hover:text-primary-neon uppercase tracking-widest flex items-center gap-1 transition-colors group">
            Toàn bộ bản ghi <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <p className="font-mono text-xs text-text-dark uppercase py-4">Chưa có luồng dữ liệu giao dịch phát sinh.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full font-mono text-xs text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-black/30 text-text-dark uppercase text-[10px] border-b border-white/5">
                  <th className="p-3">Mã định danh</th>
                  <th className="p-3">Chuyên viên nhận</th>
                  <th className="p-3 text-right">Tổng thanh toán</th>
                  <th className="p-3 text-center">Trạng thái lõi</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-3 font-bold text-text-pure uppercase tracking-wide">{order.id}</td>
                    <td className="p-3 text-text-muted uppercase text-[11px]">{order.shipping_name}</td>
                    <td className="p-3 text-right font-bold text-primary-cyan">{formatVND(order.grand_total)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}