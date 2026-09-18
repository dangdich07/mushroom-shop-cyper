import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminOrderData, TrackingLogNode } from "./admin-orders.types";

export async function getAdminOrders(client: SupabaseClient): Promise<AdminOrderData[]> {
  const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("ADMIN_ORDERS_QUERY_FAILED");
  return (data ?? []) as AdminOrderData[];
}

export async function getAdminOrderTracking(client: SupabaseClient, orderId: string): Promise<TrackingLogNode[]> {
  const { data, error } = await client
    .from("order_tracking")
    .select("id, title, description, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("ADMIN_ORDER_TRACKING_QUERY_FAILED");
  return (data ?? []) as TrackingLogNode[];
}
