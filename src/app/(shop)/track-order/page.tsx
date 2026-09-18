import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { OrderFlowHeader } from "@/components/order-flow/order-flow-header";
import { TrackingStatePanel } from "@/components/order-flow/tracking-state-panel";
import { TrackingTimeline } from "@/features/checkout/components/TrackingTimeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

interface TrackOrderPageProps {
  searchParams: Promise<{ id?: string; token?: string }>;
}

interface TrackingLog {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface PublicTrackingResult {
  success?: boolean;
  order_id?: string;
  status?: string;
  logs?: TrackingLog[];
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { id, token } = await searchParams;
  const orderId = id?.trim();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let status: string | null = null;
  let logs: TrackingLog[] = [];
  let ownerView = false;
  let lookupError = false;

  if (orderId && user) {
    const { data: order, error: orderError } = await supabase.from("orders").select("id, status").eq("id", orderId).maybeSingle();
    lookupError = Boolean(orderError);
    if (order) {
      ownerView = true;
      status = order.status;
      const { data, error } = await supabase.from("order_tracking")
        .select("id, title, description, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });
      logs = (data || []) as TrackingLog[];
      lookupError = Boolean(error);
    }
  }

  if (orderId && !ownerView && token) {
    const { data, error } = await supabase.rpc("get_public_order_tracking", {
      p_order_id: orderId,
      p_tracking_token: token,
    });
    lookupError = Boolean(error);
    const publicResult = data as PublicTrackingResult | null;
    if (publicResult?.success) {
      status = publicResult.status || null;
      logs = publicResult.logs || [];
    }
  }

  const found = Boolean(orderId && status);
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-background-deep py-12 font-mono text-xs text-text-pure sm:py-16">
      <Container>
        <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-8">
          <OrderFlowHeader eyebrow="Hành trình logistics" title="Theo dõi đơn hàng" orderId={found ? orderId : undefined} />
          {found ? (
            <TrackingTimeline orderId={orderId!} initialLogs={logs} currentStatus={status!} enableRealtime={ownerView} />
          ) : lookupError ? (
            <TrackingStatePanel kind="ERROR" title="Không thể tải thông tin theo dõi" message="Không tìm thấy thông tin theo dõi hoặc mã xác minh không hợp lệ." />
          ) : !orderId ? (
            <TrackingStatePanel kind="EMPTY" title="Thiếu mã đơn hàng" message="Không tìm thấy thông tin theo dõi hoặc mã xác minh không hợp lệ." />
          ) : !user && !token ? (
            <TrackingStatePanel kind="EMPTY" title="Cần mã xác minh" message="Không tìm thấy thông tin theo dõi hoặc mã xác minh không hợp lệ." />
          ) : (
            <TrackingStatePanel kind="EMPTY" title="Không có dữ liệu theo dõi" message="Không tìm thấy thông tin theo dõi hoặc mã xác minh không hợp lệ." />
          )}
        </div>
      </Container>
    </div>
  );
}
