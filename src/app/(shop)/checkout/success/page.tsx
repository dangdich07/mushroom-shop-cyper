import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/account/orders");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout/success?orderId=${orderId}`)}`);

  const { data: order } = await supabase.from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) redirect("/account/orders");

  return (
    <div className="min-h-[70vh] py-20 font-mono text-xs">
      <Container>
        <div className="mx-auto max-w-xl border border-primary-neon/20 bg-black/30 p-8 text-center">
          <p className="text-primary-neon font-bold uppercase tracking-widest">Đơn hàng đã được ghi nhận</p>
          <h1 className="mt-3 text-xl font-heading font-black text-text-pure">{order.id}</h1>
          <p className="mt-2 text-text-dark uppercase">Trạng thái: {order.status}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={`/track-order?id=${encodeURIComponent(order.id)}`} className="border border-primary-cyan px-4 py-2 text-primary-cyan uppercase">
              Theo dõi đơn
            </Link>
            <Link href="/account/orders" className="border border-white/10 px-4 py-2 text-text-pure uppercase">
              Đơn của tôi
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
