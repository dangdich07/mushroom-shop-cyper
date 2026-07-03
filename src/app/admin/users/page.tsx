"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Users, Search, Shield, Phone, Calendar, Activity, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";

// Định nghĩa kiểu dữ liệu vai trò tương thích với hệ thống Enum Postgres
type UserRoleType = "super_admin" | "admin" | "staff" | "customer";

interface UserProfile {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  labPosition: string;
  avatarUrl: string | null;
  role: UserRoleType;
  createdAt: string;
}

// Cấu trúc mô tả hàng dữ liệu thô nhận về từ public.profiles table
interface DbProfileRow {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  lab_position: string;
  avatar_url: string | null;
  role: UserRoleType;
  created_at: string;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // 1. TRUY QUẾT TOÀN BỘ DANH SÁCH HỒ SƠ NGƯỜI DÙNG TỪ DATABASE THẬT
  const { data: users, isLoading, isError, error } = useQuery<UserProfile[]>({
    queryKey: ["admin-all-users-profiles"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;

      return ((data as unknown as DbProfileRow[]) || []).map((u) => ({
        id: u.id, // ĐÃ SỬA CHÍ MẠNG: Thay 'v.id' bằng 'u.id' để khớp với tham số 'u' của vòng lặp .map()
        fullName: u.full_name,
        phoneNumber: u.phone_number,
        labPosition: u.lab_position,
        avatarUrl: u.avatar_url,
        role: u.role,
        createdAt: new Date(u.created_at).toLocaleDateString("vi-VN")
        }));
    }
  });

  // 2. MUTATION: ĐIỀU BIẾN ĐẶC QUYỀN ROLE HỆ THỐNG
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRoleType }) => {
      const { error: err } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      
      if (err) throw err;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users-profiles"] });
      alert("Xung đặc quyền đã được ghi đè thành công xuống lõi cơ sở dữ liệu.");
    },
    onError: (err) => {
      alert(`[THẤT BẠI TIẾN TRÌNH CAP QUYỀN]: ${err.message}`);
    }
  });

  // 3. MUTATION: THAY ĐỔI CHỨC DANH PHÒNG LAB
  const updatePositionMutation = useMutation({
    mutationFn: async ({ userId, position }: { userId: string; position: string }) => {
      const { error: err } = await supabase
        .from("profiles")
        .update({ lab_position: position.trim() })
        .eq("id", userId);
      
      if (err) throw err;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users-profiles"] });
    }
  });

  const displayUsers = (users || []).filter(u => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch = (u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeStyle = (role: UserRoleType) => {
    switch (role) {
      case "super_admin": return "border-red-500/30 text-red-400 bg-red-500/5";
      case "admin": return "border-primary-cyan/30 text-primary-cyan bg-primary-cyan/5";
      case "staff": return "border-purple-500/30 text-purple-400 bg-purple-500/5";
      default: return "border-white/10 text-text-dark bg-white/2";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-xs font-mono">
      
      {/* TIÊU ĐỀ PHÂN KHU ĐIỀU HÀNH */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-base font-heading font-black uppercase text-text-pure tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-cyan" /> HỆ THỐNG KIỂM SOÁT PHÔI ĐỊNH DANH KỸ SƯ SÀN
        </h1>
        <p className="text-[10px] text-text-dark uppercase tracking-wider">Quản lý đặc quyền tài khoản, điều biến vị trí nghiên cứu khoa học và phân cấp an ninh thượng tầng</p>
      </div>

      {/* THANH ĐIỀU HỢP BỘ LỌC VÀ DÒ TÌM */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full bg-black/20 p-4 border border-white/5">
        <div className="md:col-span-6 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dò tìm mã định danh UUID hoặc họ tên kỹ sư..." 
            className="w-full bg-background-dark border border-white/10 p-2.5 pl-9 text-text-pure outline-none focus:border-primary-neon uppercase text-xs"
          />
          <Search className="w-4 h-4 text-text-dark absolute left-3 top-3" />
        </div>
        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-text-dark uppercase shrink-0 text-[10px]">Đặc quyền lõi:</span>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon uppercase text-xs font-bold"
          >
            <option value="ALL">TOÀN BỘ CẤP BẬC</option>
            <option value="super_admin">SUPER ADMIN — Tối Cao</option>
            <option value="admin">ADMIN — Điều Hành</option>
            <option value="staff">STAFF — Kỹ Sư Sàn</option>
            <option value="customer">CUSTOMER — Bản Thể Tự Do</option>
          </select>
        </div>
        <div className="md:col-span-2 text-right text-text-dark text-[10px] uppercase">
          Quét thấy: <strong className="text-text-pure">{displayUsers.length}</strong> nhân sự khớp
        </div>
      </div>

      {/* BẢNG LEDGER DANH SÁCH NHÂN SỰ TOÀN DIỆN */}
      <div className="glass-premium p-4 border-white/5 w-full">
        {isLoading ? (
          <div className="text-primary-cyan flex items-center justify-center py-10"><Activity className="w-4 h-4 animate-spin mr-2" /> Đang truy quét phôi định danh hệ thống...</div>
        ) : isError ? (
          <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 text-red-400 w-full"><AlertTriangle className="w-4 h-4" /> Lỗi phân rã cấu trúc hồ sơ: {error instanceof Error ? error.message : "Xung đột"}</div>
        ) : displayUsers.length === 0 ? (
          <p className="text-center text-text-dark uppercase py-8">Không ghi nhận tài khoản nhân sự nào khớp với màng lọc.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-black/40 text-text-dark text-[10px] uppercase border-b border-white/5">
                  <th className="p-3">Hồ sơ định danh (UUID)</th>
                  <th className="p-3">Thông số liên lạc</th>
                  <th className="p-3">Chức danh phòng Lab (Nhấp để sửa)</th>
                  <th className="p-3 text-center">Đặc quyền lõi</th>
                  <th className="p-3 text-center">Điều biến quyền</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    
                    {/* KHỐI 1: TÊN VÀ UUID */}
                    <td className="p-3 max-w-[280px]">
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[9px] text-text-dark select-all truncate">ID: {user.id}</span>
                        <h4 className="font-heading font-black text-text-pure text-[12px] uppercase tracking-wide flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-primary-cyan shrink-0" />
                          {user.fullName || "BẢN THỂ CHƯA ĐẶT TÊN"}
                        </h4>
                      </div>
                    </td>

                    {/* KHỐI 2: SỐ ĐIỆN THOẠI & NGÀY KHỞI TẠO */}
                    <td className="p-3 text-text-muted">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-text-dark" /> {user.phoneNumber || "Không có dữ liệu"}</span>
                        <span className="flex items-center gap-1 text-[10px] text-text-dark"><Calendar className="w-3 h-3" /> Nhập sàn: {user.createdAt}</span>
                      </div>
                    </td>

                    {/* KHỐI 3: VỊ TRÍ PHÒNG LAB (INLINE EDITABLE INPUT) */}
                    <td className="p-3">
                      <input 
                        type="text" 
                        defaultValue={user.labPosition}
                        onBlur={(e) => {
                          if (e.target.value.trim() && e.target.value !== user.labPosition) {
                            updatePositionMutation.mutate({ userId: user.id, position: e.target.value });
                          }
                        }}
                        className="bg-transparent border border-transparent hover:border-white/10 focus:border-primary-cyan p-1.5 w-full text-text-pure outline-none font-bold uppercase text-[11px] transition-all"
                        title="Nhấp chuột ra ngoài để tự động ghi đè chức danh"
                      />
                    </td>

                    {/* KHỐI 4: BADGE HIỂN THỊ ROLE HIỆN TẠI */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 border text-[9px] font-black uppercase rounded-sm inline-flex items-center gap-1 ${getRoleBadgeStyle(user.role)}`}>
                        <Shield className="w-2.5 h-2.5" /> {user.role}
                      </span>
                    </td>

                    {/* KHỐI 5: SELECT BOX BIẾN ĐỔI ROLE HỎA TỐC */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <select 
                          value={user.role}
                          disabled={updateRoleMutation.isPending}
                          onChange={(e) => {
                            if (confirm(`Xác nhận bẻ gãy cấu trúc quyền hạn cũ, cấu hình tài khoản này sang vai trò [${e.target.value.toUpperCase()}]?`)) {
                              updateRoleMutation.mutate({ userId: user.id, newRole: e.target.value as UserRoleType });
                            }
                          }}
                          className="bg-background-dark border border-white/10 p-1.5 text-text-pure text-[10px] font-bold uppercase outline-none focus:border-primary-neon custom-select-arrow"
                        >
                          <option value="customer">CUSTOMER</option>
                          <option value="staff">STAFF</option>
                          <option value="admin">ADMIN</option>
                          <option value="super_admin">SUPER ADMIN</option>
                        </select>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center text-[9px] text-text-dark uppercase flex items-center justify-center gap-1 border-t border-white/5 pt-4">
        <ShieldCheck className="w-3 h-3" /> Màn hình kiểm toán đặc quyền nhân sự vô trùng hoàn tất
      </div>
    </div>
  );
}