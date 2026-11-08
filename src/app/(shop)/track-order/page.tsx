import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import Link from "next/link";
import { ChevronRight, Home, Search } from "lucide-react";
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
    <div className="relative isolate min-h-screen min-w-0 overflow-x-clip bg-background-deep py-4 text-sm text-text-pure">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,210,230,0.1),transparent_50%),linear-gradient(rgba(0,210,230,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,230,0.025)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
      <Container wide>
        <div className="mx-auto flex max-w-[1400px] min-w-0 flex-col gap-4">
          <header className="relative grid min-w-0 gap-4 overflow-hidden rounded-lg border border-primary-cyan/15 bg-surface-glass p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/catalog-lingzhi-lab.webp')] bg-cover bg-right opacity-[0.08]" />
            <div className="relative min-w-0">
              <nav aria-label="Điều hướng phân cấp" className="mb-1 flex flex-wrap items-center gap-2 text-xs text-text-dark">
                <Link href="/" className="inline-flex min-h-11 items-center gap-2 hover:text-primary-cyan focus-visible:bio-focus"><Home aria-hidden="true" className="h-3.5 w-3.5" />Trang chủ</Link>
                <ChevronRight aria-hidden="true" className="h-3 w-3" /><Link href="/account/orders" className="inline-flex min-h-11 items-center hover:text-primary-cyan focus-visible:bio-focus">Đơn hàng</Link>
                <ChevronRight aria-hidden="true" className="h-3 w-3" /><span aria-current="page" className="text-primary-cyan">Theo dõi đơn hàng</span>
              </nav>
              <h1 className="font-heading text-[clamp(26px,2.8vw,36px)] font-bold leading-tight tracking-tight">Theo dõi đơn hàng</h1>
              <p className="mt-2 text-xs leading-5 text-text-muted">Nhập mã đơn hàng để kiểm tra trạng thái và hành trình giao hàng.</p>
            </div>
            <form action="/track-order" method="get" className="relative min-w-0">
              <label htmlFor="tracking-order-id" className="mb-2 block text-xs text-text-muted">Mã đơn hàng</label>
              <div className="flex min-w-0 flex-wrap gap-2">
                <input id="tracking-order-id" name="id" defaultValue={orderId ?? ""} required placeholder="Nhập mã đơn hàng" className="min-h-11 min-w-0 flex-[1_1_180px] rounded-lg border border-primary-cyan/30 bg-background-deep px-3 text-sm text-text-pure placeholder:text-text-dark focus-visible:bio-focus" />
                {token && <input type="hidden" name="token" value={token} />}
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-neon px-5 text-sm font-semibold text-background-deep hover:bg-primary-cyan focus-visible:bio-focus"><Search aria-hidden="true" className="h-4 w-4" />Tra cứu</button>
              </div>
            </form>
          </header>
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
