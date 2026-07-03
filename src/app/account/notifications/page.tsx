"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOverlayStore } from "@/store/useOverlayStore";
import { MockDbService, NotificationItem } from "@/services/mockDb";
import { supabase } from "@/lib/supabaseClient";
import { Activity, AlertCircle, Bell, Terminal, Trash2 } from "lucide-react";

export default function AccountNotificationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Trích xuất ID phiên kết nối vô trùng từ Supabase Session
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

  // TRUY QUÉT DÒNG LOGS THÔNG BÁO TỪ TRỤC DỊCH VỤ CỐT LÕI
  const { data: notifications, isLoading, isError, error } = useQuery<NotificationItem[]>({
    queryKey: ["account-notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      return MockDbService.getNotifications(userId);
    },
    enabled: !authLoading && !!userId, // Chỉ kích hoạt khi đã giải mã xong Session
  });

  // LỆNH THANH TRỪNG BẢN GHI LOGS TRÊN TOÀN TRỤC
  const clearNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Chưa xác định danh tính kỹ sư.");
      return MockDbService.clearNotifications(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-notifications", userId] });
      addToast({ title: "LOGS CLEANED", description: "Đã dọn sạch toàn bộ bộ nhớ đệm Logs thông báo.", type: "SUCCESS" });
    }
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12 font-mono text-xs text-primary-neon w-full">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Đang đồng bộ hóa hệ thống Logs cảnh báo từ Cloud...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 font-mono text-xs text-red-400 w-full">
        <AlertCircle className="w-4 h-4" /> Lỗi tải luồng dữ liệu: {error instanceof Error ? error.message : "Xung đột cổng"}
      </div>
    );
  }

  const listNotifications = notifications || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
      {/* THANH ĐIỀU HƯỚNG TIÊU ĐỀ LỚP TRÊN */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 w-full">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-heading font-black uppercase text-text-pure tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary-cyan" /> Trung tâm Logs thông báo hệ sinh thái
          </h2>
          <p className="text-[10px] font-mono text-text-dark uppercase">Nhật ký theo dõi biến động mạch dữ liệu sinh học</p>
        </div>
        
        {listNotifications.length > 0 && (
          <button 
            type="button" 
            onClick={() => clearNotificationsMutation.mutate()} 
            disabled={clearNotificationsMutation.isPending}
            className="font-mono text-[10px] uppercase font-bold text-text-dark hover:text-red-400 border border-white/5 hover:border-red-500/20 px-2.5 py-1.5 bg-white/2 hover:bg-red-500/5 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Xóa sạch bộ nhớ Logs
          </button>
        )}
      </div>
      
      {/* THỰC THI HIỂN THỊ DANH SÁCH DỰA TRÊN DỮ LIỆU ĐỐI SOÁT */}
      {listNotifications.length === 0 ? (
        <div className="w-full py-16 border border-dashed border-white/10 text-center bg-black/10 flex flex-col items-center justify-center gap-2">
          <Bell className="w-8 h-8 text-text-dark opacity-30 animate-pulse" />
          <p className="font-mono text-xs text-text-dark uppercase">Hộp thông báo trống rỗng. Chưa có xung sự kiện mới.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 font-mono text-xs w-full">
          {listNotifications.map((ntf) => (
            <div 
              key={ntf.id} 
              className="border border-white/5 p-4 bg-background-card/20 relative group w-full hover:border-primary-cyan/30 hover:bg-black/30 transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-primary-cyan uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-neon animate-ping" />
                  ⚡ {ntf.title}
                </span>
                <span className="text-[10px] text-text-dark bg-white/5 px-2 py-0.5 border border-white/5 rounded-sm">
                  {ntf.time}
                </span>
              </div>
              <p className="text-text-muted leading-relaxed text-xs pl-4 border-l border-white/10 group-hover:border-primary-cyan/40 transition-colors">
                {ntf.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}