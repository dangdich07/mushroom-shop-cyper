"use client";

import { useEffect, useState } from "react";
import { DeliveryJourneyMap } from "@/components/order-flow/delivery-journey-map";
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
  enableRealtime?: boolean;
}

// Hàm ánh xạ Icon công nghệ dựa trên từ khóa trạng thái đơn
const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return <Clock aria-hidden="true" className="h-4 w-4 text-amber-400" />;
    case "PROCESSING":
      return <Package aria-hidden="true" className="h-4 w-4 animate-pulse text-primary-cyan motion-reduce:animate-none" />;
    case "SHIPPED":
      return <Truck aria-hidden="true" className="h-4 w-4 animate-bounce text-primary-neon motion-reduce:animate-none" />;
    case "DELIVERED":
      return <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-green-400" />;
    case "CANCELLED":
      return <XCircle aria-hidden="true" className="h-4 w-4 text-red-500" />;
    default:
      return <Box aria-hidden="true" className="h-4 w-4 text-text-muted" />;
  }
};

export function TrackingTimeline({ orderId, initialLogs, currentStatus, enableRealtime = false }: TrackingTimelineProps) {
  const [logs, setLogs] = useState<TrackingLog[]>(initialLogs);
  const [status, setStatus] = useState<string>(currentStatus);

  useEffect(() => {
    if (!enableRealtime) return;
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
  }, [orderId, enableRealtime]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit"
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 font-mono text-xs text-text-pure">
      
      {/* KHỐI TRẠNG THÁI HIỆN TẠI DẬP NỔI CAO CẤP */}
      <div className="flex min-w-0 flex-col gap-3 rounded-sm border border-white/10 bg-black/40 p-4 shadow-[0_0_15px_rgba(0,245,255,0.02)] sm:flex-row sm:items-center sm:justify-between">
        <span className="break-words text-[10px] uppercase tracking-wider text-text-dark">Trạng thái phôi sinh khối:</span>
        <div role="status" aria-live="polite" className="flex min-w-0 items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-primary-cyan">
          {getStatusIcon(status)}
          <span>{status}</span>
        </div>
      </div>

      {/* KHỐI TRỤC THỜI GIAN TIẾN TRÌNH LÂM SÀNG */}
      <DeliveryJourneyMap orderId={orderId} status={status} />

      <div className="glass-premium relative flex min-w-0 flex-col gap-6 border-white/5 p-4 sm:p-6">
        <span className="text-[10px] font-bold text-primary-neon uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
          <Activity aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-primary-neon motion-reduce:animate-none" /> ĐỊNH VỊ NHẬT KÝ HÀNH TRÌNH LOGISTICS
        </span>

        <div className="relative border-l border-white/10 pl-6 ml-2 flex flex-col gap-6">
          {logs.map((log, index) => (
            <div key={log.id} className="group relative flex min-w-0 flex-col gap-1.5 animate-in slide-in-from-left-2 duration-300 motion-reduce:animate-none">
              
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
                  <span className="break-words">{log.title}</span>
                </strong>
                <span className="text-[10px] text-text-dark font-mono shrink-0">
                  [{formatTime(log.created_at)}]
                </span>
              </div>
              <p className="break-words font-sans text-[11px] leading-relaxed text-text-muted">
                {log.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
