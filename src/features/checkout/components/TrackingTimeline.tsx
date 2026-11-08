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
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-4 text-sm text-text-pure lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      
      {/* KHỐI TRẠNG THÁI HIỆN TẠI DẬP NỔI CAO CẤP */}
      <div className="order-2 flex min-w-0 flex-col gap-3 rounded-xl border border-primary-cyan/25 bg-surface-glass p-4 backdrop-blur-xl lg:col-start-2 lg:row-start-1">
        <h2 className="border-b border-primary-cyan/15 pb-3 font-heading text-lg font-semibold">Thông tin đơn hàng</h2>
        <p className="text-xs text-text-dark">Mã đơn hàng <span className="mt-1 block break-all font-mono text-primary-cyan">{orderId}</span></p>
        <span className="text-xs text-text-dark">Trạng thái hiện tại</span>
        <div role="status" aria-live="polite" className="flex w-fit max-w-full items-center gap-2 rounded-lg border border-primary-cyan/30 bg-primary-cyan/10 px-3 py-2 text-sm font-semibold text-primary-cyan">
          {getStatusIcon(status)}
          <span className="break-words">{status}</span>
        </div>
      </div>

      {/* KHỐI TRỤC THỜI GIAN TIẾN TRÌNH LÂM SÀNG */}
      <div className="order-1 min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1"><DeliveryJourneyMap orderId={orderId} status={status} /></div>

      <div className="order-3 relative flex min-w-0 flex-col gap-4 rounded-xl border border-primary-cyan/25 bg-surface-glass p-4 backdrop-blur-xl lg:col-start-2 lg:row-start-2">
        <h2 className="flex items-center gap-2 border-b border-primary-cyan/15 pb-3 font-heading text-lg font-semibold">
          <Activity aria-hidden="true" className="h-4 w-4 text-primary-cyan" /> Lịch sử vận đơn
        </h2>
        {logs.length === 0 && <p role="status" className="text-sm leading-6 text-text-dark">Chưa có nhật ký giao hàng. Các mốc xử lý sẽ hiển thị khi được cập nhật.</p>}

        <div className="relative ml-2 flex min-w-0 flex-col gap-5 border-l border-primary-cyan/25 pl-6">
          {logs.map((log, index) => (
            <div key={log.id} className="group relative flex min-w-0 flex-col gap-1.5 animate-in slide-in-from-left-2 duration-300 motion-reduce:animate-none">
              
              {/* ĐIỂM RADAR PHÁT QUANG */}
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center border bg-background-deep ${
                index === 0 
                  ? "border-primary-cyan bg-primary-cyan/10 shadow-[0_0_10px_rgba(0,210,230,0.4)]" 
                  : "border-primary-cyan/30 bg-background-deep"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? "bg-primary-cyan animate-pulse motion-reduce:animate-none" : "bg-text-dark"}`} />
              </div>

              {/* THÔNG TIN CHI TIẾT LOG LỘ TRÌNH */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <strong className={`text-sm font-semibold ${index === 0 ? "text-primary-cyan" : "text-text-pure"}`}>
                  <span className="break-words">{log.title}</span>
                </strong>
                <span className="text-[10px] text-text-dark font-mono shrink-0">
                  [{formatTime(log.created_at)}]
                </span>
              </div>
              <p className="break-words text-xs leading-5 text-text-muted">
                {log.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
