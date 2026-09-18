import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/container";
import { OrderFlowHeader } from "@/components/order-flow/order-flow-header";
import { VietQRCard } from "@/features/checkout/components/VietQRCard";
import { Activity } from "lucide-react";

interface PaymentPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/cart");
  }

  // TRUY QUẾT DỮ LIỆU THANH TOÁN GỐC TỪ SERVER SIDE
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/payment?orderId=${orderId}`)}`);
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .select("order_id, amount, status, qr_url, reference_code, expires_at")
    .eq("order_id", orderId)
    .single();

  if (error || !payment) {
    redirect("/cart?error=PAYMENT_NOT_FOUND");
  }

  // CHẶN NẾU ĐƠN ĐÃ THANH TOÁN RỒI
  if (payment.status === "PAID") {
    redirect(`/checkout/success?orderId=${orderId}`);
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-background-deep py-12 font-mono sm:py-20">
      <Container>
        <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-8">
          <OrderFlowHeader eyebrow="Thanh toán đơn hàng" title="Trạm Quyết Toán VietQR" orderId={orderId} description="Quét mã hoặc sử dụng thông tin chuyển khoản được hiển thị cho đơn hàng này." />

          <Suspense fallback={<div role="status" className="flex items-center justify-center gap-2 py-16 text-[10px] uppercase text-primary-cyan"><Activity aria-hidden="true" className="h-6 w-6 animate-spin motion-reduce:animate-none" /> Đang tải thông tin thanh toán...</div>}>
            <VietQRCard 
              orderId={orderId}
              grandTotal={payment.amount}
              qrUrl={payment.qr_url || ""}
              referenceCode={payment.reference_code}
              expiresAt={payment.expires_at}
            />
          </Suspense>
          
          <div className="text-center">
            <p className="break-words text-[9px] uppercase leading-relaxed text-text-dark">
              * Lưu ý: Mạch thanh toán sẽ tự động đóng sau 15 phút.<br/>
              Hệ thống sẽ tự động xác nhận ngay khi xung tiền cập bến tài khoản Lab.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
