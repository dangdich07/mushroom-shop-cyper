"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Box, CheckCircle2, Clock, Truck, Package, XCircle, Activity } from "lucide-react";

interface TrackingLog {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface TrackingTimelineProps {
  orderId: string;
  initialLogs: TrackingLog[];
  currentStatus: string;
}

// Hàm ánh xạ Icon công nghệ dựa trên từ khóa trạng thái đơn
const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return <Clock className="w-4 h-4 text-amber-400" />;
    case "PROCESSING":
      return <Package className="w-4 h-4 text-primary-cyan animate-pulse" />;
    case "SHIPPED":
      return <Truck className="w-4 h-4 text-primary-neon animate-bounce" />;
    case "DELIVERED":
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case "CANCELLED":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Box className="w-4 h-4 text-text-muted" />;
  }
};

export function TrackingTimeline({ orderId, initialLogs, currentStatus }: TrackingTimelineProps) {
  const [logs, setLogs] = useState<TrackingLog[]>(initialLogs);
  const [status, setStatus] = useState<string>(currentStatus);

  useEffect(() => {
    // 1. LẮNG NGHE BIẾN ĐỘNG LỘ TRÌNH VẬN ĐƠN (ORDER_TRACKING TABLE)
    const trackingChannel = supabase
      .channel(`realtime-tracking:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_tracking",
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newLog = payload.new as TrackingLog;
          if (newLog) {
            setLogs((prev) => [newLog, ...prev]); // Đẩy mốc lộ trình mới lên đầu
          }
        }
      )
      // 2. LẮNG NGHE BIẾN ĐỘNG TRẠNG THÁI TỔNG QUÁT TRÊN BẢNG ORDERS
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new && "status" in payload.new) {
            setStatus(payload.new.status as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trackingChannel);
    };
  }, [orderId]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit"
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 font-mono text-xs text-text-pure">
      
      {/* KHỐI TRẠNG THÁI HIỆN TẠI DẬP NỔI CAO CẤP */}
      <div className="border border-white/10 bg-black/40 p-4 rounded-sm flex items-center justify-between shadow-[0_0_15px_rgba(0,245,255,0.02)]">
        <span className="text-text-dark uppercase tracking-wider text-[10px]">Trạng thái phôi sinh khối:</span>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/15 font-black uppercase text-[11px] tracking-widest text-primary-cyan">
          {getStatusIcon(status)}
          <span>{status}</span>
        </div>
      </div>

      {/* KHỐI TRỤC THỜI GIAN TIẾN TRÌNH LÂM SÀNG */}
      <div className="glass-premium p-6 border-white/5 flex flex-col gap-6 relative">
        <span className="text-[10px] font-bold text-primary-neon uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 animate-spin text-primary-neon" /> ĐỊNH VỊ NHẬT KÝ HÀNH TRÌNH LOGISTICS
        </span>

        <div className="relative border-l border-white/10 pl-6 ml-2 flex flex-col gap-6">
          {logs.map((log, index) => (
            <div key={log.id} className="relative flex flex-col gap-1.5 group animate-in slide-in-from-left-2 duration-300">
              
              {/* ĐIỂM RADAR PHÁT QUANG */}
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center border bg-background-deep ${
                index === 0 
                  ? "border-primary-neon bg-primary-neon/10 shadow-[0_0_10px_#00FF66]" 
                  : "border-white/20 bg-neutral-900"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? "bg-primary-neon animate-pulse" : "bg-text-dark"}`} />
              </div>

              {/* THÔNG TIN CHI TIẾT LOG LỘ TRÌNH */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <strong className={`font-bold uppercase tracking-wide text-[11px] ${index === 0 ? "text-primary-neon" : "text-text-pure"}`}>
                  {log.title}
                </strong>
                <span className="text-[10px] text-text-dark font-mono shrink-0">
                  [{formatTime(log.created_at)}]
                </span>
              </div>
              <p className="text-text-muted text-[11px] font-sans leading-relaxed">
                {log.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}