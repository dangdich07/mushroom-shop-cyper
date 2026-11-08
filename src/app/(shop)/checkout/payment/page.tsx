import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/container";
import Link from "next/link";
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
    <div className="relative isolate min-w-0 overflow-x-clip bg-background-deep py-[8px] text-text-pure">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/catalog-lingzhi-lab.webp')] bg-cover bg-center opacity-[0.12]" />
      <Container wide>
        <div className="mx-auto flex max-w-[1360px] min-w-0 flex-col gap-[8px]">
          <nav aria-label="Điều hướng phân cấp" className="flex flex-wrap items-center gap-2 text-xs text-text-dark">
            <Link href="/cart" className="inline-flex min-h-11 items-center hover:text-primary-cyan focus-visible:bio-focus">Giỏ hàng</Link>
            <span aria-hidden="true">/</span>
            <Link href="/checkout" className="inline-flex min-h-11 items-center hover:text-primary-cyan focus-visible:bio-focus">Thanh toán</Link>
            <span aria-hidden="true">/</span><span aria-current="page" className="text-primary-cyan">VietQR</span>
          </nav>

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
            <p className="break-words text-xs leading-relaxed text-text-dark">
              Vui lòng giữ trang này mở trong khi chờ xác nhận. Hệ thống tự chuyển sang trang hoàn tất khi thanh toán được ghi nhận.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
