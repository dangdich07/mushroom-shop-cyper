"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { MockDbService } from "@/services/mockDb"; // Liên thông API dịch vụ lõi
import { formatVND } from "@/lib/utils";
import { Activity, AlertCircle, ShoppingBag } from "lucide-react";

interface OrderItem {
  id: string;
  createdAt: string;
  created_at?: string;
  status: string;
  grandTotal: number;
  grand_total?: number;
}

export default function AccountOrdersPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Trích xuất ID phiên kết nối vô trùng của kỹ sư đăng nhập
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          setUserId("usr-01"); // Tọa độ fallback khớp hoàn toàn với quy trình checkout
        }
      } catch {
        setUserId("usr-01");
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  // Kích hoạt cổng kéo dữ liệu Dynamic Client-side Rendering từ Database Cloud
  const { data: orders, isLoading, isError, error } = useQuery<OrderItem[]>({
    queryKey: ["account-orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      return MockDbService.getUserOrders(userId) as unknown as Promise<OrderItem[]>;
    },
    enabled: !authLoading && !!userId,
  });

  // HÀM ĐIỀU BIẾN MÀU SẮC ĐỘNG THEO TRẠNG THÁI KIỂM TOÁN VẬN ĐƠN
  const getStatusStyles = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "PENDING":
        return "bg-primary-cyan/10 text-primary-cyan border-primary-cyan/20";
      case "COMPLETED":
      case "SUCCESS":
        return "bg-primary-neon/10 text-primary-neon border-primary-neon/20";
      case "CANCELLED":
      case "FAILED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-white/5 text-text-muted border-white/10";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12 font-mono text-xs text-primary-neon">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Đang truy xuất hồ sơ giao dịch từ màng dữ liệu Cloud...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 font-mono text-xs text-red-400 w-full">
        <AlertCircle className="w-4 h-4" /> Lỗi giải mã dòng dữ liệu: {error instanceof Error ? error.message : "Xung đột cổng"}
      </div>
    );
  }

  const displayOrders = orders || [];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200 w-full">
      <h2 className="text-base font-heading font-black uppercase text-text-pure tracking-widest border-b border-white/5 pb-2">
        Nhật ký kiểm toán giao dịch
      </h2>
      
      {displayOrders.length === 0 ? (
        <div className="w-full py-12 border border-dashed border-white/10 text-center bg-black/10 flex flex-col items-center justify-center gap-2">
          <ShoppingBag className="w-8 h-8 text-text-dark" />
          <p className="font-mono text-xs text-text-dark uppercase">Chưa phát sinh bản ghi vận đơn nào trên trục màng đám mây.</p>
        </div>
      ) : (
        <div className="border border-white/5 bg-black/5 overflow-x-auto w-full">
          <table className="w-full font-mono text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-black/40 text-primary-cyan font-bold uppercase border-b border-white/10">
                <th className="p-3">Mã Vận Đơn</th>
                <th className="p-3">Thời Gian</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-right">Tổng Tiền Đơn</th>
                <th className="p-3 text-center">Tương Tác</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order) => {
                const orderId = order.id;
                const timeStamp = order.createdAt || order.created_at || "N/A";
                const statusText = order.status || "PENDING";
                const amount = order.grandTotal || order.grand_total || 0;

                return (
                  <tr key={orderId} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-3 font-bold text-text-pure uppercase tracking-wider">{orderId}</td>
                    <td className="p-3 text-text-dark">{timeStamp}</td>
                    <td className="p-3 text-center">
                      {/* CẤY GHÉP SỬA ĐỔI: Sử dụng hàm map màu sắc động */}
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase border ${getStatusStyles(statusText)}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-primary-cyan">{formatVND(amount)}</td>
                    <td className="p-3 text-center">
                      <Link href={`/track-order?id=${orderId}`} className="text-primary-neon hover:text-primary-cyan hover:underline text-[11px] uppercase font-bold transition-colors">
                        Đối soát Router
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}