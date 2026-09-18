import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminUserProfile, AdminUserRole } from "./admin-users.types";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  lab_position: string | null;
  avatar_url: string | null;
  role: AdminUserRole;
  created_at: string;
}

export async function getAdminUsers(client: SupabaseClient): Promise<AdminUserProfile[]> {
  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name, phone_number, lab_position, avatar_url, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("ADMIN_USERS_QUERY_FAILED");

  return ((data ?? []) as ProfileRow[]).map((row) => ({
    id: row.id,
    email: row.email ?? "",
    fullName: row.full_name ?? "",
    phoneNumber: row.phone_number ?? "",
    labPosition: row.lab_position ?? "",
    avatarUrl: row.avatar_url ?? "",
    role: row.role,
    createdAt: row.created_at,
  }));
}
