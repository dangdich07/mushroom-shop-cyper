"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/utils";
import { useOverlayStore } from "@/store/useOverlayStore";
import { updateOrderStatusAdminAction } from "@/app/admin/orders/actions";
import { OrderStatusType, PaymentMethodType } from "@/types/payment.types";
import { 
  Layers, Search, Clock, Truck, User, 
  Activity, AlertCircle, Plus, Send, RefreshCw 
} from "lucide-react";

// Cấu trúc Type-safe dữ liệu Bản ghi Đơn hàng lõi
interface AdminOrderData {
  id: string;
  user_id: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  grand_total: number;
  status: OrderStatusType;
  payment_method: PaymentMethodType;
  shipping_name: string;
  shipping_phone: string;
  shipping_detail: string;
  shipping_area: string;
  items: Array<{ product_id: string; quantity: number }>;
  created_at: string;
}

// Cấu trúc hành trình phân tách từ bảng order_tracking độc lập
interface TrackingLogNode {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  const [logTitle, setLogTitle] = useState("");
  const [logDesc, setLogDesc] = useState("");

  // Trích xuất chữ ký phiên làm việc của Admin tối cao
  useEffect(() => {
    async function getAdminSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentAdminId(session.user.id);
      }
    }
    getAdminSession();
  }, []);

  // 1. TRUY QUẾT TOÀN BỘ DANH SÁCH VẬN ĐƠN TRÊN KÊNH LIVE CLOUD
  const { data: orders, isLoading, isError, error, refetch } = useQuery<AdminOrderData[]>({
    queryKey: ["admin-all-orders"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (err) throw err;
      return (data || []) as AdminOrderData[];
    }
  });

  // 2. TRUY QUẾT RIÊNG NHẬT KÝ LỘ TRÌNH TỪ BẢNG LIÊN KẾT ĐỘC LẬP KHI CLICK CHỌN ĐƠN
  const { data: trackingLogs, isLoading: isLogsLoading } = useQuery<TrackingLogNode[]>({
    queryKey: ["admin-order-tracking", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return [];
      const { data, error: err } = await supabase
        .from("order_tracking")
        .select("id, title, description, created_at")
        .eq("order_id", selectedOrderId)
        .order("created_at", { ascending: false });
      
      if (err) throw err;
      return (data || []) as TrackingLogNode[];
    },
    enabled: !!selectedOrderId
  });

  // 3. TRIỆU HỒI SERVER ACTION ĐIỀU PHỐI TRẠNG THÁI SANG CHU TRÌNH LOGISTICS MỚI
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatusType }) => {
      if (!currentAdminId) throw new Error("Chưa kiểm toán được token đặc quyền Admin.");
      const res = await updateOrderStatusAdminAction(id, status, currentAdminId);
      if (!res.success) throw new Error(res.error);
      return status;
    },
    onSuccess: (targetStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-tracking", selectedOrderId] });
      addToast({ title: "ĐIỀU HỢP THÀNH CÔNG", description: `Vận đơn dịch chuyển trạng thái thành: ${targetStatus}`, type: "SUCCESS" });
    },
    onError: (err: Error) => {
      addToast({ title: "MẠCH LỆNH CHẶN", description: err.message, type: "ERROR" });
    }
  });

  // 4. KÍCH HOẠT QUY TRÌNH GEOWRITE: CẤY THÊM NODE LOGS LỘ TRÌNH ĐỘC LẬP ĐẦU CUỐI
  const injectTrackingLogMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrderId || !currentAdminId) throw new Error("Không thể nạp lệnh chèn khi thiếu tham số.");
      const { error: err } = await supabase
        .from("order_tracking")
        .insert({
          order_id: selectedOrderId,
          title: logTitle.toUpperCase().trim(),
          description: logDesc.trim(),
          actor_id: currentAdminId
        });
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order-tracking", selectedOrderId] });
      addToast({ title: "CẤY LOGS THÀNH CÔNG", description: "Vệ tinh tracking phía Client đã nhận xung dữ liệu mới thời gian thực.", type: "SUCCESS" });
      setLogTitle("");
      setLogDesc("");
    },
    onError: (err: Error) => {
      addToast({ title: "SỰ CỐ KHỚP LỆNH", description: err.message, type: "ERROR" });
    }
  });

  const listOrders = orders || [];
  
  const filteredOrders = listOrders.filter(o => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.shipping_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeOrder = listOrders.find(o => o.id === selectedOrderId) || null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "PROCESSING": return "text-primary-cyan border-primary-cyan/20 bg-primary-cyan/5";
      case "SHIPPED": return "text-purple-400 border-purple-500/20 bg-purple-500/5";
      case "DELIVERED": return "text-primary-neon border-primary-neon/20 bg-primary-neon/5";
      default: return "text-red-400 border-red-500/20 bg-red-500/5";
    }
  };

  if (isError) {
    return (
      <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 font-mono text-xs text-red-400 w-full">
        <AlertCircle className="w-4 h-4" /> Hệ thống kiểm toán lỗi liên thông: {error instanceof Error ? error.message : "Crash trục truyền dẫn"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-xs font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-heading font-black uppercase text-text-pure tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-cyan" /> TRUNG TÂM KIỂM TOÁN & ĐIỀU ĐỘNG VẬN ĐƠN LIVE
          </h1>
          <p className="text-[10px] text-text-dark uppercase tracking-wider">Cấu trúc lộ trình di chuyển và phân cấp xử lý trạng thái logistics</p>
        </div>
        <button onClick={() => refetch()} className="bg-white/5 border border-white/10 hover:border-primary-cyan px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer uppercase transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> TẢI LẠI TRẠM TÂM
        </button>
      </div>

      {/* THANH CÔNG CỤ TÌM KIẾM VÀ BỘ LỌC PHÂN TẦN */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full bg-black/20 p-4 border border-white/5">
        <div className="md:col-span-5 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dò mã vận đơn (MUSH-...), tên kỹ sư tiếp nhận..." 
            className="w-full bg-background-dark border border-white/10 p-2.5 pl-9 text-text-pure outline-none focus:border-primary-neon uppercase text-xs"
          />
          <Search className="w-4 h-4 text-text-dark absolute left-3 top-3" />
        </div>
        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-text-dark uppercase shrink-0 text-[10px]">Trạng thái:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon uppercase text-xs font-bold"
          >
            <option value="ALL">TOÀN BỘ TRẠNG THÁI VẬN ĐƠN</option>
            <option value="PENDING">PENDING — Đang Chờ</option>
            <option value="PROCESSING">PROCESSING — Đóng Gói</option>
            <option value="SHIPPED">SHIPPED — Xe Vận Chuyển</option>
            <option value="DELIVERED">DELIVERED — Đã Tiếp Nhận</option>
            <option value="CANCELLED">CANCELLED — Lệnh Tiêu Hủy</option>
          </select>
        </div>
        <div className="md:col-span-3 text-right text-text-dark text-[10px] uppercase font-bold">
          Đơn khớp lệnh: <strong className="text-primary-cyan">{filteredOrders.length}</strong>
        </div>
      </div>

      {/* WORKSPACE CHIA ĐÔI ĐA LƯU TRỮ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* KHỐI TRÁI: THẺ ĐƠN TÓM GỌN (5 CỘT) */}
        <div className="lg:col-span-5 flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="text-primary-cyan flex items-center justify-center py-10"><Activity className="w-4 h-4 animate-spin mr-2" /> Đang đồng bộ hóa kho dữ liệu...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 text-text-dark uppercase">Không có bản ghi vận đơn phù hợp.</div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrderId(order.id)}
                className={`border p-3.5 flex flex-col gap-2 cursor-pointer transition-all ${
                  selectedOrderId === order.id 
                    ? "border-primary-cyan bg-primary-cyan/5 shadow-[0_0_12px_rgba(0,245,255,0.05)]" 
                    : "border-white/5 bg-background-card/10 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-pure uppercase tracking-wide text-xs">{order.id}</span>
                  <span className={`px-2 py-0.5 border text-[9px] font-black uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-text-muted text-[11px]">
                  <span className="uppercase truncate max-w-[60%]">{order.shipping_name}</span>
                  <strong className="text-primary-cyan">{formatVND(order.grand_total)}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        {/* KHỐI PHẢI: CHI TIẾT BẢN GHI VÀ PANEL CẤY GHÉP TRACKING LOGS (7 CỘT) */}
        <div className="lg:col-span-7 w-full">
          {activeOrder ? (
            <div className="flex flex-col gap-5 border border-white/5 bg-background-card/10 p-5 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-4 gap-3">
                <div>
                  <span className="text-[10px] text-text-dark uppercase block">Mã định vị hạt nhân đơn</span>
                  <h3 className="text-sm font-bold text-text-pure tracking-wider">{activeOrder.id}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-dark uppercase text-[10px]">Lệnh logistics nhanh:</span>
                  <select
                    value={activeOrder.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: activeOrder.id, status: e.target.value as OrderStatusType })}
                    disabled={updateStatusMutation.isPending}
                    className="bg-background-dark border border-white/10 p-2 text-text-pure focus:border-primary-neon outline-none font-bold text-xs uppercase"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/5 pb-4 text-[11px]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-dark uppercase flex items-center gap-1"><User className="w-3 h-3" /> Người Kỹ sư Tiếp Nhận</span>
                  <strong className="text-text-pure uppercase font-black">{activeOrder.shipping_name} — {activeOrder.shipping_phone}</strong>
                  <span className="text-text-muted leading-relaxed mt-0.5">{activeOrder.shipping_detail}, <strong className="text-primary-cyan">{activeOrder.shipping_area}</strong></span>
                </div>
                <div className="flex flex-col sm:items-end justify-center border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] text-text-dark uppercase">Hóa đơn quyết toán cuối</span>
                  <span className="text-base font-black text-primary-neon mt-0.5">{formatVND(activeOrder.grand_total)}</span>
                  <span className="text-[9px] text-text-dark mt-0.5 uppercase bg-white/5 border border-white/10 px-1.5 py-0.5">GIAO THỨC: {activeOrder.payment_method}</span>
                </div>
              </div>

              {/* FORM CẤY LOGS ĐỘNG PHÂN TÁCH SANG BẢNG TRACKING SẠCH RÁC */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!logTitle.trim() || !logDesc.trim()) return;
                  injectTrackingLogMutation.mutate();
                }}
                className="bg-black/40 border border-white/5 p-4 flex flex-col gap-3.5"
              >
                <span className="text-[10px] text-primary-neon uppercase font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Plus className="w-3.5 h-3.5" /> Gieo Toạ Độ / Sự Kiện Lộ Trình Mới (Relational Node Injector)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1 flex flex-col gap-1">
                    <label className="text-[9px] text-text-dark uppercase">Mốc sự kiện chính</label>
                    <input 
                      type="text" 
                      value={logTitle}
                      onChange={(e) => setLogTitle(e.target.value)}
                      placeholder="VD: PHÂN PHỐI HỎA TỐC" 
                      className="bg-background-dark border border-white/10 p-2 text-text-pure text-xs outline-none focus:border-primary-neon uppercase font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] text-text-dark uppercase">Diễn giải thuộc tính lâm sàng</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={logDesc}
                        onChange={(e) => setLogDesc(e.target.value)}
                        placeholder="Mẫu vật nấm chaga đã thông qua bộ lọc thông mạch..." 
                        className="w-full bg-background-dark border border-white/10 p-2 text-text-pure text-xs outline-none focus:border-primary-neon"
                      />
                      <button 
                        type="submit" 
                        disabled={injectTrackingLogMutation.isPending || !logTitle.trim() || !logDesc.trim()}
                        className="bg-primary-cyan text-background-deep px-4 flex items-center justify-center hover:bg-primary-neon transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* TIMELINE KẾT XUẤT TỪ BẢNG LIÊN KẾT ĐỘC LẬP TẠI GIAO DIỆN CHỈ HUY */}
              <div className="flex flex-col gap-3 mt-1">
                <span className="text-[10px] text-text-dark uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Trục Node Lộ Trình Cơ Sở (Realtime Streams):</span>
                <div className="relative pl-4 border-l border-white/10 flex flex-col gap-4 ml-1">
                  {isLogsLoading ? (
                    <span className="text-text-dark animate-pulse uppercase text-[10px]">Đang đồng bộ dòng thời gian...</span>
                  ) : trackingLogs && trackingLogs.length > 0 ? (
                    trackingLogs.map((log) => (
                      <div key={log.id} className="flex flex-col gap-0.5 text-[11px]">
                        <span className="text-[9px] text-text-dark font-mono">[{new Date(log.created_at).toLocaleString("vi-VN")}]</span>
                        <h4 className="font-bold text-text-pure uppercase tracking-wide text-primary-cyan">{log.title}</h4>
                        <p className="text-text-muted leading-tight">{log.description}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-dark uppercase text-[10px] italic">Chưa ghi nhận hành trình di chuyển cho vận đơn này.</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="w-full py-24 border border-dashed border-white/10 text-center text-text-dark uppercase flex flex-col items-center justify-center gap-2 bg-[#070a12]">
              <Truck className="w-7 h-7 opacity-30 text-primary-cyan animate-pulse" />
              Vui lòng chọn một mã vận đơn ở cột bên trái để kích hoạt màn hình kiểm toán lộ trình chi tiết
            </div>
          )}
        </div>

      </div>
    </div>
  );
}