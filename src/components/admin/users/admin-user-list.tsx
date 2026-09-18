import type { AdminUserCapabilities, AdminUserProfile, AdminUserRole } from "@/features/admin/users/admin-users.types";
import { AdminUserCard } from "./admin-user-card";

interface Props { users: AdminUserProfile[]; capabilities: AdminUserCapabilities; pending: boolean; onPositionSave: (user: AdminUserProfile, position: string) => void; onRoleRequest: (user: AdminUserProfile, role: AdminUserRole) => void }
export function AdminUserList({ users, capabilities, pending, onPositionSave, onRoleRequest }: Props) {
  return <section aria-label="Danh sách người dùng" className="grid min-w-0 gap-3">{users.map((user) => <AdminUserCard key={user.id} user={user} capabilities={capabilities} pending={pending} onPositionSave={(position) => onPositionSave(user, position)} onRoleRequest={(role) => onRoleRequest(user, role)} />)}</section>;
}
