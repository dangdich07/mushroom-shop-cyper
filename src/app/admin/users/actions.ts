"use server";

import { revalidatePath } from "next/cache";
import type { AdminRoleChangeInput, AdminUserCapabilities } from "@/features/admin/users/admin-users.types";
import { getAdminIdentity } from "@/lib/adminAuth";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

interface AdminUserActionResponse { success: boolean; error?: string }

export async function getAdminUserCapabilitiesAction(): Promise<AdminUserCapabilities> {
  const identity = await getAdminIdentity();
  return { actorId: identity.id, actorRole: identity.role };
}

export async function updateAdminUserRoleAction(input: AdminRoleChangeInput): Promise<AdminUserActionResponse> {
  try {
    const actor = await getAdminIdentity();
    const reason = input.reason.trim();
    if (!input.targetUserId || !["customer", "staff", "admin", "super_admin"].includes(input.newRole) || reason.length < 3 || reason.length > 500) {
      return { success: false, error: "Thông tin thay đổi quyền không hợp lệ." };
    }
    const { data, error } = await supabaseServiceRole.rpc("admin_update_profile_role", {
      p_target_user_id: input.targetUserId,
      p_new_role: input.newRole,
      p_reason: reason,
      p_actor_id: actor.id,
    });
    const result = data as { success?: boolean; error_code?: string } | null;
    if (error || !result?.success) {
      const messages: Record<string, string> = {
        SELF_ROLE_CHANGE_FORBIDDEN: "Bạn không thể tự thay đổi quyền của chính mình.",
        SUPER_ADMIN_REQUIRED: "Chỉ Super Admin mới được cấp hoặc thu hồi quyền quản trị.",
        PROFILE_NOT_FOUND: "Không tìm thấy hồ sơ người dùng.",
      };
      return { success: false, error: messages[result?.error_code ?? ""] ?? "Không thể cập nhật quyền lúc này." };
    }
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể cập nhật quyền lúc này." };
  }
}

export async function updateAdminUserPositionAction(userId: string, position: string): Promise<AdminUserActionResponse> {
  try {
    const actor = await getAdminIdentity();
    const normalized = position.trim();
    if (!userId || normalized.length < 1 || normalized.length > 120) return { success: false, error: "Chức danh không hợp lệ." };

    const { data: target, error: targetError } = await supabaseServiceRole.from("profiles").select("role").eq("id", userId).single();
    if (targetError || !target) return { success: false, error: "Không tìm thấy hồ sơ người dùng." };
    if (target.role === "super_admin" && actor.role !== "super_admin") return { success: false, error: "Chỉ Super Admin mới được sửa hồ sơ Super Admin." };

    const { error } = await supabaseServiceRole.from("profiles").update({ lab_position: normalized }).eq("id", userId);
    if (error) return { success: false, error: "Không thể cập nhật chức danh lúc này." };
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Không thể cập nhật chức danh lúc này." };
  }
}
