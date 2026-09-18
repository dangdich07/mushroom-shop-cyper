export type AdminUserRole = "super_admin" | "admin" | "staff" | "customer";
export type AdminUserRoleFilter = "ALL" | AdminUserRole;

export interface AdminUserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  labPosition: string;
  avatarUrl: string;
  role: AdminUserRole;
  createdAt: string;
}

export interface AdminUserCapabilities {
  actorId: string;
  actorRole: "admin" | "super_admin";
}

export interface AdminRoleChangeInput {
  targetUserId: string;
  newRole: AdminUserRole;
  reason: string;
}
