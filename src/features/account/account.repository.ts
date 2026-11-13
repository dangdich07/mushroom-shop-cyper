import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountAddress, AccountDashboardData, AccountNotification, AccountOrder, AccountProfile } from "./account.types";

type OrderItemRow = { product_id?: string; productId?: string; name?: string; product_name?: string };
type OrderRow = { id: string; created_at: string; status: string; grand_total: number | string; items?: unknown };
type NotificationRow = { id: string; time: string | null; title: string; desc: string };
type ProfileRow = { id: string; email: string | null; full_name: string | null; phone_number: string | null; lab_position: string | null; avatar_url: string | null };

function getProductIds(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => item as OrderItemRow).map((item) => item.product_id ?? item.productId).filter((id): id is string => Boolean(id));
}

function getProductName(items: unknown, productNames: Map<string, string>): string {
  if (!Array.isArray(items)) return "Đơn hàng";
  const rows = items.map((item) => item as OrderItemRow);
  const embeddedName = rows.find((item) => item.name)?.name ?? rows.find((item) => item.product_name)?.product_name;
  if (embeddedName) return embeddedName;
  return rows.map((item) => productNames.get(item.product_id ?? item.productId ?? "")).find(Boolean) ?? "Sản phẩm trong đơn";
}

function mapOrder(row: OrderRow, productNames: Map<string, string>): AccountOrder {
  return { id: row.id, createdAt: row.created_at, status: row.status, grandTotal: Number(row.grand_total), productName: getProductName(row.items, productNames) };
}

export async function getAccountOrders(client: SupabaseClient): Promise<AccountOrder[]> {
  const { data, error } = await client.from("orders").select("id, created_at, status, grand_total, items").order("created_at", { ascending: false });
  if (error) throw new Error("ACCOUNT_ORDERS_QUERY_FAILED");
  const rows = (data ?? []) as OrderRow[];
  const productIds = [...new Set(rows.flatMap((row) => getProductIds(row.items)))];
  const productNames = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: products } = await client.from("products").select("id, name").in("id", productIds);
    for (const product of products ?? []) productNames.set(String(product.id), String(product.name));
  }
  return rows.map((row) => mapOrder(row, productNames));
}

export async function getAccountDashboard(client: SupabaseClient): Promise<AccountDashboardData> {
  const [orders, walletResult] = await Promise.all([
    getAccountOrders(client),
    client.from("loyalty_wallets").select("points").maybeSingle(),
  ]);
  if (walletResult.error) throw new Error("ACCOUNT_LOYALTY_QUERY_FAILED");
  return {
    orders,
    loyaltyPoints: walletResult.data?.points ?? 0,
    totalSpent: orders.reduce((total, order) => total + order.grandTotal, 0),
  };
}

export async function getAccountNotifications(client: SupabaseClient): Promise<AccountNotification[]> {
  const { data, error } = await client.from("notifications").select("id, time, title, desc").order("created_at", { ascending: false });
  if (error) throw new Error("ACCOUNT_NOTIFICATIONS_QUERY_FAILED");
  return ((data ?? []) as NotificationRow[]).map((row) => ({ id: row.id, time: row.time ?? "", title: row.title, desc: row.desc }));
}

export async function deleteAccountNotifications(client: SupabaseClient): Promise<void> {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error("ACCOUNT_AUTH_REQUIRED");
  const { error } = await client.from("notifications").delete().eq("user_id", userData.user.id);
  if (error) throw new Error("ACCOUNT_NOTIFICATIONS_DELETE_FAILED");
}

export async function getAccountAddresses(client: SupabaseClient): Promise<AccountAddress[]> {
  const { data, error } = await client.from("addresses").select("id, name, phone, area, detail").order("created_at", { ascending: false });
  if (error) throw new Error("ACCOUNT_ADDRESSES_QUERY_FAILED");
  return (data ?? []) as AccountAddress[];
}

export async function getAccountProfile(client: SupabaseClient, userId: string): Promise<AccountProfile> {
  const { data, error } = await client.from("profiles").select("id, email, full_name, phone_number, lab_position, avatar_url").eq("id", userId).single();
  if (error || !data) throw new Error("ACCOUNT_PROFILE_QUERY_FAILED");
  const row = data as ProfileRow;
  return { id: row.id, email: row.email ?? "", fullName: row.full_name ?? "", phoneNumber: row.phone_number ?? "", labPosition: row.lab_position ?? "", avatarUrl: row.avatar_url ?? "" };
}
