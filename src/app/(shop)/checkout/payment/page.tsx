import { Suspense } from "react";
import { redirect } from "next/navigation";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";
import { Container } from "@/components/layout/container";
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
  const { data: payment, error } = await supabaseServiceRole
    .from("payments")
    .select("*, orders(grand_total)")
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
    <div className="min-h-screen py-20 bg-background-deep font-mono">
      <Container>
        <div className="max-w-xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-heading font-black text-text-pure uppercase tracking-tighter">
              Trạm Quyết Toán VietQR
            </h1>
            <p className="text-text-dark text-[10px] uppercase tracking-widest">
              Đơn hàng: <span className="text-primary-cyan">{orderId}</span>
            </p>
          </div>

          <Suspense fallback={<Activity className="w-10 h-10 animate-spin text-primary-cyan mx-auto" />}>
            <VietQRCard 
              orderId={orderId}
              grandTotal={payment.amount}
              qrUrl={payment.qr_url || ""}
              referenceCode={payment.reference_code}
            />
          </Suspense>
          
          <div className="text-center">
            <p className="text-[9px] text-text-dark uppercase leading-relaxed">
              * Lưu ý: Mạch thanh toán sẽ tự động đóng sau 15 phút.<br/>
              Hệ thống sẽ tự động xác nhận ngay khi xung tiền cập bến tài khoản Lab.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}