import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
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

  if (orderId && user) {
    const { data: order } = await supabase.from("orders").select("id, status").eq("id", orderId).maybeSingle();
    if (order) {
      ownerView = true;
      status = order.status;
      const { data } = await supabase.from("order_tracking")
        .select("id, title, description, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });
      logs = (data || []) as TrackingLog[];
    }
  }

  if (orderId && !ownerView && token) {
    const { data } = await supabase.rpc("get_public_order_tracking", {
      p_order_id: orderId,
      p_tracking_token: token,
    });
    const publicResult = data as PublicTrackingResult | null;
    if (publicResult?.success) {
      status = publicResult.status || null;
      logs = publicResult.logs || [];
    }
  }

  const found = Boolean(orderId && status);
  return (
    <div className="min-h-screen py-16 bg-background-deep font-mono text-xs text-text-pure">
      <Container>
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <div className="border-b border-white/5 pb-4">
            <h1 className="text-2xl font-heading font-black uppercase">Theo dõi đơn hàng</h1>
            {found && <p className="text-text-dark mt-2">Mã đơn: <span className="text-primary-cyan">{orderId}</span></p>}
          </div>
          {found ? (
            <TrackingTimeline orderId={orderId!} initialLogs={logs} currentStatus={status!} enableRealtime={ownerView} />
          ) : (
            <div className="border border-white/10 bg-black/30 p-8 text-center text-text-dark uppercase">
              Không tìm thấy thông tin theo dõi hoặc mã xác minh không hợp lệ.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
