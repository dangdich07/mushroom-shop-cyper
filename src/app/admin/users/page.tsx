"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertTriangle, Calendar, Phone, Search, Shield, ShieldCheck, UserCheck, Users } from "lucide-react";
import { AdminRoleChangeModal } from "@/components/admin/users/admin-role-change-modal";
import { getAdminUsers } from "@/features/admin/users/admin-users.repository";
import type { AdminUserProfile, AdminUserRole, AdminUserRoleFilter } from "@/features/admin/users/admin-users.types";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { getAdminUserCapabilitiesAction, updateAdminUserPositionAction, updateAdminUserRoleAction } from "./actions";

function roleBadgeClass(role: AdminUserRole) {
  if (role === "super_admin") return "border-red-500/30 bg-red-500/5 text-red-400";
  if (role === "admin") return "border-primary-cyan/30 bg-primary-cyan/5 text-primary-cyan";
  if (role === "staff") return "border-purple-500/30 bg-purple-500/5 text-purple-400";
  return "border-white/10 bg-white/2 text-text-dark";
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>("ALL");
  const [roleTarget, setRoleTarget] = useState<AdminUserProfile | null>(null);
  const [requestedRole, setRequestedRole] = useState<AdminUserRole>("customer");
  const [roleReason, setRoleReason] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin-all-users-profiles"], queryFn: () => getAdminUsers(supabase) });
  const capabilitiesQuery = useQuery({ queryKey: ["admin-user-capabilities"], queryFn: getAdminUserCapabilitiesAction, staleTime: 60_000 });

  const roleMutation = useMutation({
    mutationFn: async () => {
      if (!roleTarget) throw new Error("Không tìm thấy hồ sơ cần đổi quyền.");
      const result = await updateAdminUserRoleAction({ targetUserId: roleTarget.id, newRole: requestedRole, reason: roleReason });
      if (!result.success) throw new Error(result.error ?? "Không thể cập nhật quyền lúc này.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users-profiles"] });
      setRoleTarget(null);
      setRoleReason("");
      addToast({ title: "ĐÃ CẬP NHẬT QUYỀN", description: "Vai trò mới đã được áp dụng và ghi vào nhật ký kiểm toán.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ ĐỔI QUYỀN", description: error.message, type: "ERROR" }),
  });

  const positionMutation = useMutation({
    mutationFn: async ({ user, position }: { user: AdminUserProfile; position: string }) => {
      const result = await updateAdminUserPositionAction(user.id, position);
      if (!result.success) throw new Error(result.error ?? "Không thể cập nhật chức danh.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users-profiles"] });
      addToast({ title: "ĐÃ LƯU CHỨC DANH", description: "Chức danh phòng Lab đã được cập nhật.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ CẬP NHẬT", description: error.message, type: "ERROR" }),
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const displayUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesSearch = !query || user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.id.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);
  const pending = roleMutation.isPending || positionMutation.isPending;

  function requestRoleChange(user: AdminUserProfile, role: AdminUserRole) {
    if (role === user.role) return;
    setRoleTarget(user);
    setRequestedRole(role);
    setRoleReason("");
  }
  const closeRoleModal = useCallback(() => {
    if (!roleMutation.isPending) {
      setRoleTarget(null);
      setRoleReason("");
    }
  }, [roleMutation.isPending]);
  function submitRoleChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleMutation.isPending) roleMutation.mutate();
  }

  const loading = usersQuery.isLoading || capabilitiesQuery.isLoading;
  const failed = usersQuery.isError || capabilitiesQuery.isError;
  const capabilities = capabilitiesQuery.data;
  return (
    <div className="flex w-full min-w-0 flex-col gap-6 font-mono text-xs">
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="flex items-center gap-2 font-heading text-base font-black uppercase tracking-widest text-text-pure"><Users aria-hidden="true" className="h-4 w-4 text-primary-cyan" />Hệ thống kiểm soát phôi định danh kỹ sư sàn</h1>
        <p className="text-[10px] uppercase tracking-wider text-text-dark">Quản lý đặc quyền tài khoản, vị trí nghiên cứu và phân cấp an ninh thượng tầng</p>
      </div>

      <div className="grid w-full grid-cols-1 items-center gap-4 border border-white/5 bg-black/20 p-4 md:grid-cols-12">
        <div className="relative md:col-span-6"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Dò tìm UUID, email hoặc họ tên kỹ sư..." className="min-h-11 w-full border border-white/10 bg-background-dark py-2 pl-9 pr-3 text-xs uppercase text-text-pure focus-visible:bio-focus" /></div>
        <div className="flex items-center gap-2 md:col-span-4"><label htmlFor="legacy-role-filter" className="shrink-0 text-[10px] uppercase text-text-dark">Đặc quyền lõi:</label><select id="legacy-role-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as AdminUserRoleFilter)} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 text-xs font-bold uppercase text-text-pure focus-visible:bio-focus"><option value="ALL">Toàn bộ cấp bậc</option><option value="super_admin">Super Admin — Tối cao</option><option value="admin">Admin — Điều hành</option><option value="staff">Staff — Kỹ sư sàn</option><option value="customer">Customer — Khách hàng</option></select></div>
        <div className="text-[10px] uppercase text-text-dark md:col-span-2 md:text-right">Quét thấy: <strong className="text-text-pure">{displayUsers.length}</strong> nhân sự</div>
      </div>

      <div className="glass-premium w-full border-white/5 p-4">
        {loading ? <div className="flex items-center justify-center py-10 text-primary-cyan"><Activity aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />Đang truy quét phôi định danh...</div> : failed || !capabilities ? <div className="flex w-full items-center gap-2 border border-red-500/20 bg-red-500/5 p-4 text-red-400"><AlertTriangle aria-hidden="true" className="h-4 w-4" />Không thể tải dữ liệu người dùng lúc này.</div> : displayUsers.length === 0 ? <p className="py-8 text-center uppercase text-text-dark">Không ghi nhận tài khoản nào khớp với màng lọc.</p> : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead><tr className="border-b border-white/5 bg-black/40 text-[10px] uppercase text-text-dark"><th className="p-3">Hồ sơ định danh (UUID)</th><th className="p-3">Thông số liên lạc</th><th className="p-3">Chức danh phòng Lab</th><th className="p-3 text-center">Đặc quyền lõi</th><th className="p-3 text-center">Điều biến quyền</th></tr></thead>
              <tbody>{displayUsers.map((user) => {
                const isSelf = user.id === capabilities.actorId;
                const isSuperAdmin = capabilities.actorRole === "super_admin";
                const canChangeRole = !isSelf && (isSuperAdmin || ["customer", "staff"].includes(user.role));
                const canEditPosition = isSuperAdmin || user.role !== "super_admin";
                return <tr key={user.id} className="border-b border-white/5 transition-colors hover:bg-white/2"><td className="max-w-[280px] p-3"><div className="flex min-w-0 flex-col gap-0.5"><span className="select-all truncate text-[9px] text-text-dark">ID: {user.id}</span><h2 className="flex items-center gap-1 break-words font-heading text-[12px] font-black uppercase tracking-wide text-text-pure"><UserCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary-cyan" />{user.fullName || "Bản thể chưa đặt tên"}{isSelf && <span className="ml-1 border border-primary-neon/30 px-1.5 py-0.5 font-mono text-[7px] text-primary-neon">Bạn</span>}</h2></div></td><td className="p-3 text-text-muted"><div className="flex flex-col gap-0.5 text-[11px]"><span className="flex items-center gap-1"><Phone aria-hidden="true" className="h-3 w-3 text-text-dark" />{user.phoneNumber || "Không có dữ liệu"}</span><span className="flex items-center gap-1 text-[10px] text-text-dark"><Calendar aria-hidden="true" className="h-3 w-3" />Nhập sàn: {new Intl.DateTimeFormat("vi-VN").format(new Date(user.createdAt))}</span></div></td><td className="p-3"><input type="text" defaultValue={user.labPosition} disabled={!canEditPosition || pending} maxLength={120} onBlur={(event) => { const position = event.target.value.trim(); if (position && position !== user.labPosition) positionMutation.mutate({ user, position }); }} className="w-full border border-transparent bg-transparent p-1.5 text-[11px] font-bold uppercase text-text-pure hover:border-white/10 focus-visible:bio-focus disabled:opacity-40" title="Nhấp ra ngoài để lưu chức danh" /></td><td className="p-3 text-center"><span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 text-[9px] font-black uppercase ${roleBadgeClass(user.role)}`}><Shield aria-hidden="true" className="h-2.5 w-2.5" />{user.role}</span></td><td className="p-3"><div className="flex justify-center"><select value={user.role} disabled={!canChangeRole || pending} onChange={(event) => requestRoleChange(user, event.target.value as AdminUserRole)} aria-label={`Thay đổi vai trò của ${user.fullName || user.id}`} className="min-h-10 border border-white/10 bg-background-dark p-1.5 text-[10px] font-bold uppercase text-text-pure focus-visible:bio-focus disabled:opacity-40"><option value="customer">Customer</option><option value="staff">Staff</option>{isSuperAdmin && <option value="admin">Admin</option>}{isSuperAdmin && <option value="super_admin">Super Admin</option>}</select></div></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 border-t border-white/5 pt-4 text-center text-[9px] uppercase text-text-dark"><ShieldCheck aria-hidden="true" className="h-3 w-3" />Màn hình kiểm toán đặc quyền nhân sự vô trùng hoàn tất</div>
      <AdminRoleChangeModal user={roleTarget} newRole={requestedRole} reason={roleReason} pending={roleMutation.isPending} onReasonChange={setRoleReason} onClose={closeRoleModal} onSubmit={submitRoleChange} />
    </div>
  );
}
