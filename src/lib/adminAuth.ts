import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

const ADMIN_ROLES = ["admin", "super_admin"] as const;

interface AdminProfileRow {
  full_name: string | null;
  avatar_url: string | null;
  lab_position: string | null;
  role: string;
}

export interface AdminIdentity {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  labPosition: string;
  role: "admin" | "super_admin";
}

async function getUserFromTrustedSource(accessToken?: string): Promise<User> {
  const authClient = accessToken ? supabaseServiceRole : await createSupabaseServerClient();
  const { data: { user }, error } = accessToken
    ? await supabaseServiceRole.auth.getUser(accessToken)
    : await authClient.auth.getUser();

  if (error || !user) throw new Error("ADMIN_AUTH_REQUIRED");
  return user;
}

async function getAdminProfile(userId: string): Promise<AdminProfileRow> {
  const { data, error } = await supabaseServiceRole
    .from("profiles")
    .select("full_name, avatar_url, lab_position, role")
    .eq("id", userId)
    .single();

  if (error || !data || !ADMIN_ROLES.includes(data.role as (typeof ADMIN_ROLES)[number])) {
    throw new Error("ADMIN_ACCESS_FORBIDDEN");
  }

  return data as AdminProfileRow;
}

export async function requireAdmin(accessToken?: string) {
  const user = await getUserFromTrustedSource(accessToken);
  await getAdminProfile(user.id);
  return user;
}

export async function getAdminIdentity(): Promise<AdminIdentity> {
  const user = await getUserFromTrustedSource();
  const profile = await getAdminProfile(user.id);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name ?? "",
    avatarUrl: profile.avatar_url?.startsWith("data:") ? "" : profile.avatar_url ?? "",
    labPosition: profile.lab_position ?? profile.role.toUpperCase(),
    role: profile.role as AdminIdentity["role"],
  };
}
