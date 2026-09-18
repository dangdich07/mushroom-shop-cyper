import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { OrderSuccessPanel } from "@/components/order-flow/order-success-panel";
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
    <div className="min-h-[70vh] min-w-0 overflow-x-clip py-12 font-mono text-xs sm:py-20">
      <Container>
        <OrderSuccessPanel orderId={order.id} status={order.status} />
      </Container>
    </div>
  );
}
