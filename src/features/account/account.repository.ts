import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountAddress, AccountDashboardData, AccountNotification, AccountOrder, AccountProfile } from "./account.types";

type OrderRow = { id: string; created_at: string; status: string; grand_total: number | string };
type NotificationRow = { id: string; time: string | null; title: string; desc: string };
type ProfileRow = { id: string; email: string | null; full_name: string | null; phone_number: string | null; lab_position: string | null; avatar_url: string | null };

function mapOrder(row: OrderRow): AccountOrder {
  return { id: row.id, createdAt: row.created_at, status: row.status, grandTotal: Number(row.grand_total) };
}

export async function getAccountOrders(client: SupabaseClient): Promise<AccountOrder[]> {
  const { data, error } = await client.from("orders").select("id, created_at, status, grand_total").order("created_at", { ascending: false });
  if (error) throw new Error("ACCOUNT_ORDERS_QUERY_FAILED");
  return ((data ?? []) as OrderRow[]).map(mapOrder);
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
