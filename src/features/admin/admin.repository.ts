import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminDashboardOrder, AdminDashboardStats } from "./admin.types";

interface OrderRow {
  id: string;
  grand_total: number | string;
  status: string;
  shipping_name: string;
  created_at: string;
}

function mapOrder(row: OrderRow): AdminDashboardOrder {
  return {
    id: row.id,
    grandTotal: Number(row.grand_total),
    status: row.status,
    shippingName: row.shipping_name,
    createdAt: row.created_at,
  };
}

export async function getAdminDashboard(client: SupabaseClient): Promise<AdminDashboardStats> {
  const [ordersResult, usersResult, productsResult] = await Promise.all([
    client.from("orders").select("id, grand_total, status, shipping_name, created_at").order("created_at", { ascending: false }),
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("products").select("id", { count: "exact", head: true }),
  ]);

  if (ordersResult.error || usersResult.error || productsResult.error) {
    throw new Error("ADMIN_DASHBOARD_QUERY_FAILED");
  }

  const orders = ((ordersResult.data ?? []) as OrderRow[]).map(mapOrder);
  return {
    totalRevenue: orders.filter((order) => order.status !== "CANCELLED").reduce((total, order) => total + order.grandTotal, 0),
    totalOrders: orders.length,
    totalUsers: usersResult.count ?? 0,
    totalProducts: productsResult.count ?? 0,
    recentOrders: orders.slice(0, 5),
  };
}

