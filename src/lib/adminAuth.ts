import "server-only";

import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

export async function requireAdmin(accessToken: string) {
  if (!accessToken) throw new Error("Phiên quản trị không hợp lệ.");

  const { data: { user }, error: authError } = await supabaseServiceRole.auth.getUser(accessToken);
  if (authError || !user) throw new Error("Phiên đăng nhập đã hết hạn.");

  const { data: profile, error: profileError } = await supabaseServiceRole
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Tài khoản không có đặc quyền quản trị.");
  }

  return user;
}
