"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { ShieldAlert, KeyRound, Save, Activity, User, Camera } from "lucide-react";
import { getAccountProfile } from "@/features/account/account.repository";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { addToast, setGlobalLoading } = useOverlayStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(false);

  // 1. STATE QUẢN TRỊ BIỂU MẪU HỒ SƠ ĐỊNH DANH (STATEFUL PROFILE FORM)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [labPosition, setLabPosition] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  // 2. STATE ĐIỀU BIẾN PHÂN HỆ BẢO MẬT KHÓA LÕI
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // TRÍCH XUẤT TOÀN DIỆN THÔNG TIN TÀI KHOẢN VÀ METADATA TỪ CLOUD
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error("ACCOUNT_AUTH_REQUIRED");
        const profile = await getAccountProfile(supabase, user.id);
        setUserEmail(user.email ?? profile.email);
        setFullName(profile.fullName);
        setPhone(profile.phoneNumber);
        setLabPosition(profile.labPosition);
        setAvatarUrl(profile.avatarUrl);
      } catch {
        setProfileError(true);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  // HẠ TẦNG XỬ LÝ MÃ HÓA TẢI LÊN AVATAR PHÔI ẢNH ĐẠI DIỆN
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type)) {
      addToast({ title: "ĐỊNH DẠNG KHÔNG HỢP LỆ", description: "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.", type: "ERROR" });
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast({ title: "VƯỢT DUNG LƯỢNG", description: "Kích thước ảnh đại diện phòng Lab không được vượt quá 2MB.", type: "ERROR" });
      e.target.value = "";
      return;
    }

    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    addToast({ title: "ẢNH ĐÃ SẴN SÀNG", description: "Nhấn đồng bộ thông tin hồ sơ để tải ảnh lên.", type: "SUCCESS" });
  };

  // ĐƯỜNG ỐNG ĐỒNG BỘ THÔNG TIN HỒ SƠ LÊN CLOUD METADATA ENGINE
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      addToast({ title: "THIẾU THÔNG TIN", description: "Vui lòng nhập đầy đủ các thông số danh tính kỹ sư.", type: "ERROR" });
      return;
    }

    setGlobalLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("ACCOUNT_AUTH_REQUIRED");

      let nextAvatarUrl = avatarUrl.startsWith("data:") ? "" : avatarUrl;
      if (avatarFile) {
        const avatarPath = `${user.id}/avatar`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(avatarPath, avatarFile, {
            cacheControl: "3600",
            contentType: avatarFile.type,
            upsert: true
          });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
        nextAvatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.toUpperCase().trim(),
          phone_number: phone.trim(),
          lab_position: labPosition,
          avatar_url: nextAvatarUrl
        }
      });

      if (error) throw error;
      setAvatarUrl(nextAvatarUrl);
      setAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl("");
      }
      addToast({ title: "ĐỒNG BỘ HỒ SƠ", description: "Dữ liệu định danh nhân sự phòng thí nghiệm đã được lưu vĩnh viễn.", type: "SUCCESS" });
      router.refresh();
    } catch {
      addToast({ title: "LỖI PHỄU TRUYỀN", description: "Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại.", type: "ERROR" });
    } finally {
      setGlobalLoading(false);
    }
  };

  // GIỮ NGUYÊN 100% ĐƯỜNG ỐNG ĐỒNG BỘ MẬT MÃ MỚI LÊN CLOUD AUTH ENGINE CŨ CỦA BẠN
  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      addToast({ title: "THIẾU THÔNG TIN", description: "Vui lòng nhập đầy đủ các trường mật mã bảo mật.", type: "ERROR" });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({ title: "XUNG ĐỘT CẤU TRÚC", description: "Xác nhận mật mã không trùng khớp với mã gốc.", type: "ERROR" });
      return;
    }

    if (newPassword.length < 6) {
      addToast({ title: "ĐỘ DÀI KHÔNG ĐẠT", description: "Mật mã khóa lõi phải chứa ít nhất 6 ký tự mã hóa.", type: "ERROR" });
      return;
    }

    setGlobalLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      addToast({ title: "ĐỒNG BỘ THÀNH CÔNG", description: "Mật mã khóa lõi hệ thống đã được tái cấu trúc thành công.", type: "SUCCESS" });
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      addToast({ title: "BẺ GÃY TIẾN TRÌNH", description: "Không thể cập nhật mật khẩu lúc này. Vui lòng thử lại.", type: "ERROR" });
    } finally {
      setGlobalLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="font-mono text-xs text-primary-neon flex items-center gap-2 py-6">
        <Activity className="w-4 h-4 animate-spin" /> Đang giải mật hồ sơ bảo mật người dùng...
      </div>
    );
  }

  if (profileError) {
    return (
      <div role="alert" className="border border-red-500/20 bg-red-500/5 p-5 font-mono text-xs text-red-400">
        Không thể tải hồ sơ tài khoản lúc này.
        <button type="button" onClick={() => window.location.reload()} className="ml-3 min-h-10 border border-red-500/20 px-3 uppercase">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-500 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-heading font-black uppercase text-text-pure tracking-tight">Thiết Lập Tài Khoản</h2>
        <p className="text-xs font-mono text-text-dark uppercase">Quản lý định danh danh tính và tái cấu trúc khóa bảo mật lõi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* KHỐI TRÁI: ĐỒNG BỘ SONG SONG CẢ HAI FORM TRÊN TRỤC THỜI GIAN REALTIME (7 CỘT) */}
        <div className="lg:col-span-7 flex flex-col gap-8 w-full">
          
          {/* FORM 1: BIỂU MẪU CẬP NHẬT THÔNG TIN HỒ SƠ ĐỊNH DANH KỸ SƯ */}
          <form onSubmit={handleUpdateProfile} className="glass-premium p-6 flex flex-col gap-5 w-full">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-text-pure flex items-center gap-1.5 border-b border-white/5 pb-3">
              <User className="w-4 h-4 text-primary-cyan" /> Thông Tin Định Danh Nhân Sự
            </h3>

            {/* AVATAR BOX KIẾN TRÚC MÃ HÓA */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 border border-white/5 bg-black/20 font-mono text-xs">
              <div className="relative w-16 h-16 border border-primary-cyan/40 bg-background-dark overflow-hidden group shrink-0">
                {avatarPreviewUrl || (avatarUrl && !avatarUrl.startsWith("data:")) ? (
                  <img src={avatarPreviewUrl || avatarUrl} alt="Ảnh đại diện tài khoản" className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-text-dark" aria-label="Chưa có ảnh đại diện">
                    <User className="h-6 w-6" aria-hidden="true" />
                  </span>
                )}
                <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-[9px] text-primary-cyan font-bold gap-0.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>NẠP PHÔI</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <span className="text-text-pure font-bold uppercase tracking-wide text-[11px]">Sơ đồ sinh trắc học đại diện</span>
                <p className="text-[10px] text-text-dark leading-tight max-w-sm">Hỗ trợ ảnh JPEG, PNG hoặc WebP dưới 2MB. Ảnh sẽ được tải lên kho lưu trữ khi đồng bộ hồ sơ.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-dark uppercase">Họ và tên Kỹ sư</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-cyan uppercase font-bold" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-dark uppercase">Tần số phòng Lab (SĐT)</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-cyan" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-[10px] text-text-dark uppercase">Phân khu cấp bậc phòng ban</label>
              <select 
                value={labPosition}
                onChange={(e) => setLabPosition(e.target.value)}
                className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-cyan uppercase custom-select-arrow"
              >
                <option value="KỸ SƯ TRƯỞNG PHÒNG LAB-A">Kỹ Sư Trưởng Phòng Lab-A</option>
                <option value="CHUYÊN GIA BIẾN ĐỔI GEN SINH KHỐI">Chuyên Gia Biến Đổi Gen Sinh Khối</option>
                <option value="GIÁM SÁT VIÊN HỆ THỐNG BẢO ÔN">Giám Sát Viên Hệ Thống Bảo Ôn</option>
                <option value="BẢN THỂ TỰ DO CẤP ĐỘ CAO">Bản Thể Tự Do Cấp Độ Cao</option>
              </select>
            </div>

            <button type="submit" className="h-11 bg-primary-cyan text-background-deep font-mono font-bold text-xs uppercase tracking-widest hover:bg-primary-neon transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Save className="w-4 h-4" /> Đồng bộ thông tin hồ sơ
            </button>
          </form>

          {/* FORM 2: GIỮ NGUYÊN HOÀN TOÀN MÃ NGUỒN FORM ĐỔI MẬT MÃ CŨ CỦA BẠN */}
          <form onSubmit={handleUpdateSecurity} className="glass-premium p-6 flex flex-col gap-5 w-full">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-text-pure flex items-center gap-1.5 border-b border-white/5 pb-3">
              <KeyRound className="w-4 h-4 text-primary-neon" /> Tái Cấu Trúc Khóa Lõi Bảo Mật
            </h3>

            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-[10px] text-text-dark uppercase">Định Danh Bản Thể (Email cố định)</label>
              <input 
                type="text" 
                disabled 
                value={userEmail ?? ""} 
                className="bg-background-dark/50 border border-white/5 p-3 text-text-dark outline-none cursor-not-allowed select-none font-bold" 
              />
            </div>

            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-[10px] text-text-dark uppercase">Mật Mã Khóa Lõi Mới</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập tối thiểu 6 ký tự bảo mật..." 
                className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-neon" 
              />
            </div>

            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <label className="text-[10px] text-text-dark uppercase">Xác Nhận Khóa Lõi Mới</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật mã khóa lõi mới..." 
                className="bg-background-dark border border-white/10 p-3 text-text-pure outline-none focus:border-primary-neon" 
              />
            </div>

            <button type="submit" className="h-11 bg-primary-neon text-background-deep font-mono font-bold text-xs uppercase tracking-widest shadow-neon-cyan hover:bg-primary-cyan transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer">
              <Save className="w-4 h-4" /> Lưu cấu trúc bảo mật
            </button>
          </form>
        </div>

        {/* KHỐI PHẢI: THÔNG TIN CẢNH BÁO KIỂM TOÁN (5 CỘT) */}
        <aside className="lg:col-span-5 border border-dashed border-white/10 bg-background-card/20 p-5 flex flex-col gap-3 font-mono text-[10px] text-text-dark uppercase leading-relaxed lg:sticky lg:top-24">
          <div className="flex items-center gap-1 text-red-500 font-bold text-xs mb-1">
            <ShieldAlert className="w-4 h-4 shrink-0" /> Nhật Ký An Ninh Phòng Lab
          </div>
          <p>● Thông tin tên kỹ sư danh tính và số điện thoại liên kết sau khi đồng bộ thành công sẽ được gài làm phôi dữ liệu địa chỉ mặc định cho các hóa đơn quyết toán sinh khối nấm tiếp theo.</p>
          <p>● Mật mã mới sẽ lập tức vô hiệu hóa toàn bộ các mã Token định danh cũ trên các thiết bị ngoại vi khác.</p>
          <p>● Chu kỳ đổi khóa an toàn khuyến nghị từ Hội đồng Khoa học: 90 ngày truy cập hỏa tốc.</p>
          <p>● Hệ thống thực thi cơ chế băm mật mã SHA-256 một chiều trực tiếp tại đầu cuối Cloud trước khi lưu kho.</p>
        </aside>
      </div>
    </div>
  );
}
