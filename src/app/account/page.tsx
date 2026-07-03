"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { MockDbService } from "@/services/mockDb";
import { formatVND } from "@/lib/utils";
import { Activity } from "lucide-react";

interface OrderItem {
  id: string;
  createdAt: string;
  created_at?: string;
  status: string;
  grandTotal: number;
  grand_total?: number;
}

export default function AccountDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          setUserId("usr-01");
        }
      } catch {
        setUserId("usr-01");
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  const { data: orders, isLoading } = useQuery<OrderItem[]>({
    queryKey: ["account-orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      return MockDbService.getUserOrders(userId);
    },
    enabled: !authLoading && !!userId,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12 font-mono text-xs text-primary-neon w-full">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Đang cập nhật ma trận chỉ số sinh học...
      </div>
    );
  }

  const localOrders = orders || [];
  const totalSpent = localOrders.reduce((acc, order) => acc + (order.grandTotal || order.grand_total || 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-heading font-black uppercase text-text-pure tracking-wider">Trung Tâm Điều Phối Cá Nhân</h2>
        <p className="text-xs font-mono text-text-dark">Chào mừng trở lại. Hệ thống ghi nhận lần đăng nhập cuối: 11.06.2026 - 02:45:10</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs w-full">
        <div className="bg-background-card/30 border border-white/5 p-4 flex flex-col gap-1.5">
          <span className="text-[10px] text-text-dark uppercase">Tổng Đơn Hàng</span>
          <span className="text-xl font-black text-text-pure">{localOrders.length}</span>
        </div>
        <div className="bg-background-card/30 border border-white/5 p-4 flex flex-col gap-1.5">
          <span className="text-[10px] text-text-dark uppercase">Điểm Tích Lũy</span>
          <span className="text-xl font-black text-secondary-purple">350 Pts</span>
        </div>
        <div className="bg-background-card/30 border border-white/5 p-4 flex flex-col gap-1.5">
          <span className="text-[10px] text-text-dark uppercase">Tổng Quyết Toán</span>
          <span className="text-xl font-black text-primary-cyan">{formatVND(totalSpent)}</span>
        </div>
        <div className="bg-background-card/30 border border-white/5 p-4 flex flex-col gap-1.5">
          <span className="text-[10px] text-text-dark uppercase">Trạng Thái Sinh Học</span>
          <span className="text-xl font-black text-primary-neon uppercase">Active</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4 w-full">
        <h3 className="font-heading font-black text-xs text-primary-cyan uppercase tracking-widest border-b border-white/5 pb-2">Nhật ký hệ thống gần đây</h3>
        <div className="flex flex-col gap-2 font-mono text-xs">
          {localOrders.length > 0 ? (
            <div className="p-3 border border-white/5 bg-white/2 flex justify-between items-center">
              <span className="text-text-pure">● Vận đơn hỏa tốc {localOrders[0].id} đã được ghi nhận trên cổng dữ liệu Cloud</span>
              <span className="text-[10px] text-text-dark">Vừa xong</span>
            </div>
          ) : (
            <div className="p-3 border border-white/5 bg-white/2 flex justify-between items-center">
              <span className="text-text-pure">● Hệ thống sẵn sàng tiếp nhận phễu quyết toán sinh khối nấm</span>
              <span className="text-[10px] text-text-dark">Hiện tại</span>
            </div>
          )}
          <div className="p-3 border border-white/5 bg-white/2 flex justify-between items-center">
            <span className="text-text-pure">● Cập nhật thành công Token mật mã an ninh đám mây</span>
            <span className="text-[10px] text-text-dark">1 ngày trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}