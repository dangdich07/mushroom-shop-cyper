import { Suspense } from "react";
import { redirect } from "next/navigation";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { Container } from "@/components/layout/container";
import { TrackingTimeline } from "@/features/checkout/components/TrackingTimeline";
import { formatVND } from "@/lib/utils";
import { Activity, ShieldCheck } from "lucide-react";


interface TrackOrderPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { id: orderId } = await searchParams;

  // Chặn nếu khuyết thiếu mã vận đơn định danh
  if (!orderId) {
    redirect("/cart");
  }

  // 1. TRUY VẤN LIVE TOÀN BỘ PHÔI ĐƠN HÀNG VÀ REVIEW NHẬT KÝ HÀNH TRÌNH TỪ SERVER-SIDE
  const { data: order, error: orderError } = await supabaseServiceRole
    .from("orders")
    .select("*, order_items(*, products(name))")
    .eq("id", orderId)
    .single();

  const { data: trackingLogs } = await supabaseServiceRole
  .from("order_tracking")
  .select("id, title, description, created_at")
  .eq("order_id", orderId)
  .order("created_at", { ascending: false });

  if (orderError || !order) {
    redirect("/cart?error=ORDER_NOT_FOUND");
  }

  return (
    <div className="min-h-screen py-16 bg-background-deep font-mono text-xs text-text-pure">
      <Container>
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          
          {/* HEADER BAR ĐIỀU HƯỚNG */}
          <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
            <h1 className="text-2xl font-heading font-black uppercase tracking-tight">
              Trạm Định Vị Vận Đơn Sinh Khối
            </h1>
            <p className="text-text-dark text-[10px] uppercase">
              Mã phôi: <span className="text-primary-cyan font-bold">{orderId}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* CỘT TRÁI: BÁO CÁO TÓM TẮT ĐƠN VÀ CHI PHÍ (1 CỘT) */}
            <div className="md:col-span-1 bg-black/30 border border-white/5 p-4 flex flex-col gap-4">
              <span className="text-[10px] text-text-dark uppercase font-bold border-b border-white/5 pb-1.5 block">
                Thông số vận đơn
              </span>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-dark text-[9px] uppercase">Kỹ sư tiếp nhận:</span>
                  <strong className="text-text-pure uppercase tracking-wide">{order.shipping_name}</strong>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-dark text-[9px] uppercase">Tần số (Phone):</span>
                  <strong className="text-text-pure">{order.shipping_phone}</strong>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-dark text-[9px] uppercase">Đặc khu tiếp nhận:</span>
                  <strong className="text-primary-cyan font-bold">{order.shipping_area}</strong>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-white/5 pt-2">
                  <span className="text-text-dark text-[9px] uppercase">Tổng giá trị cấp phép:</span>
                  <strong className="text-primary-neon text-sm font-black">{formatVND(order.grand_total)}</strong>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: TRỤC THỜI GIAN THEO DÕI REALTIME (2 CỘT) */}
            <div className="md:col-span-2 w-full">
              <Suspense fallback={<div className="text-center text-primary-cyan py-10"><Activity className="w-5 h-5 animate-spin mx-auto mb-2" /> Đang đồng bộ hóa tọa độ vệ tinh...</div>}>
                <TrackingTimeline 
                  orderId={orderId} 
                  initialLogs={trackingLogs || []} 
                  currentStatus={order.status}
                />
              </Suspense>
            </div>

          </div>

          {/* BOTTOM FOOTER RADAR */}
          <div className="text-center mt-4">
            <span className="text-[9px] text-text-dark uppercase flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-text-dark" /> Mạch định vị liên kết mạng lưới Quantum Radar hoạt động ổn định
            </span>
          </div>

        </div>
      </Container>
    </div>
  );
}