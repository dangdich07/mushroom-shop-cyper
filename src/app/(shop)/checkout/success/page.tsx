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
    <div className="relative isolate min-w-0 overflow-x-clip bg-background-deep py-4 text-sm sm:py-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/catalog-lingzhi-lab.webp')] bg-cover bg-right-top opacity-[0.12]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,210,230,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,230,0.035)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <Container wide>
        <OrderSuccessPanel orderId={order.id} status={order.status} />
      </Container>
    </div>
  );
}
