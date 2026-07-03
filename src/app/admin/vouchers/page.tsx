"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/utils";
import { useOverlayStore } from "@/store/useOverlayStore";
import { saveVoucherAdminAction, deleteVoucherAdminAction } from "@/app/admin/vouchers/actions";
import { 
  Tag, Plus, Trash2, Edit2, Calendar, Search, 
  Percent, DollarSign, Activity, AlertTriangle, X, Save, ShieldCheck 
} from "lucide-react";

// Khai báo cấu trúc dữ liệu chuẩn ánh xạ từ Supabase Cloud
interface DbVoucherRow {
  id: string;
  code: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  min_subtotal: number;
  description: string | null;
  expiry_date: string;
  created_at: string;
}

export default function AdminVouchersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  // MÀNG TRẠNG THÁI BIỂU MẪU ĐIỀU BIẾN PHỄU ƯU ĐÃI
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 0,
    minSubtotal: 0,
    description: "",
    expiryDate: "2026-12-31", // Cố định đệm thời gian thực tế dự án năm 2026
  });

  // 1. TRUY QUẾT TOÀN BỘ MA TRẬN MÃ GIẢM GIÁ TỪ SUPABASE LIVE TẦNG SÂU
  const { data: vouchers, isLoading, isError, error } = useQuery<DbVoucherRow[]>({
    queryKey: ["admin-all-vouchers"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      return (data || []) as DbVoucherRow[];
    }
  });

  // 2. MUTATION: TRIỆU HỒI SERVER ACTION ĐỂ LƯU HOẶC GHI ĐÈ BIẾN THỂ VOUCHER
  const saveVoucherMutation = useMutation({
    mutationFn: async () => {
      if (formData.discountType === "PERCENT" && formData.discountValue > 100) {
        throw new Error("Hàm lượng chiết khấu phần trăm không được vượt ngưỡng 100%");
      }

      const payload = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        min_subtotal: formData.minSubtotal,
        description: formData.description.trim(),
        expiry_date: formData.expiryDate
      };

      const res = await saveVoucherAdminAction(payload, editingVoucherId);
      if (!res.success) throw new Error(res.error);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-vouchers"] });
      addToast({ 
        title: "XÁC LẬP THÀNH CÔNG", 
        description: editingVoucherId ? "Đã cập nhật biến động phễu ưu đãi." : "Đã kích hoạt phôi voucher mới lên trục màng đám mây.", 
        type: "SUCCESS" 
      });
      setIsModalOpen(false);
      setEditingVoucherId(null);
    },
    onError: (err: Error) => {
      addToast({ title: "BÁO ĐỘNG LOGIC", description: err.message, type: "ERROR" });
    }
  });

  // 3. MUTATION: TIÊU HỦY MÃ ƯU ĐÃI KHỎI LÕI ĐÁM MÂY QUA SERVER ACTION
  const deleteVoucherMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await deleteVoucherAdminAction(code);
      if (!res.success) throw new Error(res.error);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-vouchers"] });
      addToast({ title: "THANH TRỪNG THÀNH CÔNG", description: "Mã ưu đãi đã bị xóa sổ vĩnh viễn khỏi trục lưu trữ.", type: "SUCCESS" });
    },
    onError: (err: Error) => {
      addToast({ title: "THAO TÁC THẤT BẠI", description: err.message, type: "ERROR" });
    }
  });

  const openCreateModal = () => {
    setEditingVoucherId(null);
    setFormData({
      code: "",
      discountType: "PERCENT",
      discountValue: 0,
      minSubtotal: 0,
      description: "",
      expiryDate: "2026-12-31",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: DbVoucherRow) => {
    setEditingVoucherId(voucher.code);
    setFormData({
      code: voucher.code,
      discountType: voucher.discount_type,
      discountValue: voucher.discount_value,
      minSubtotal: voucher.min_subtotal,
      description: voucher.description || "",
      expiryDate: voucher.expiry_date,
    });
    setIsModalOpen(true);
  };

  const displayVouchers = (vouchers || []).filter(v => 
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-xs font-mono">
      
      {/* TIÊU ĐỀ PHÂN KHU BIÊN ĐỘ QUẢN TRỊ */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-heading font-black uppercase text-text-pure tracking-widest flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary-cyan" /> TRUNG TÂM ĐIỀU PHỐI PHỄU GIẢM GIÁ VOUCHERS LIVE
          </h1>
          <p className="text-[10px] text-text-dark uppercase tracking-wider">Cấu hình tham số chiết khấu, khấu hao giá trần đơn hàng và lập thời hạn đóng phễu ưu đãi</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="h-10 bg-primary-neon text-background-deep font-bold px-4 flex items-center gap-1.5 uppercase tracking-wider hover:bg-primary-cyan transition-all cursor-pointer shadow-neon-cyan/10"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> TẠO PHỄU ƯU ĐÃI MỚI
        </button>
      </div>

      {/* THANH TÌM KIẾM QUÉT MÃ */}
      <div className="relative w-full bg-black/20 border border-white/5 p-3 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dò tìm mã voucher hoặc mô tả thuộc tính..." 
            className="w-full bg-background-dark border border-white/10 p-2 pl-9 text-text-pure outline-none focus:border-primary-neon uppercase text-xs font-bold"
          />
          <Search className="w-4 h-4 text-text-dark absolute left-3 top-2.5" />
        </div>
        <div className="text-text-dark text-[10px] uppercase ml-auto font-bold">
          Mật độ xung: <strong className="text-primary-cyan">{displayVouchers.length}</strong> phôi mã khả dụng
        </div>
      </div>

      {/* DANH SÁCH MÃ GIẢM GIÁ DẠNG THÊ HOLOGRAM LƯỚI NÉN */}
      {isLoading ? (
        <div className="text-primary-cyan flex items-center justify-center py-12"><Activity className="w-4 h-4 animate-spin mr-2" /> Đang đồng bộ hóa cổng dữ liệu voucher...</div>
      ) : isError ? (
        <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 text-red-400 w-full"><AlertTriangle className="w-4 h-4" /> Lỗi xung tủy phân rã voucher: {error instanceof Error ? error.message : "Xung đột cấu trúc"}</div>
      ) : displayVouchers.length === 0 ? (
        <p className="text-center text-text-dark uppercase py-8">Chưa ghi nhận phôi mã giảm giá nào trên trục đám mây thô.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {displayVouchers.map((v) => (
            <div 
              key={v.code} 
              className="border border-white/5 bg-background-card/10 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-primary-cyan/30 transition-all duration-300"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-cyan/5 rounded-full blur-xl group-hover:bg-primary-cyan/10 transition-all" />

              <div className="flex justify-between items-start border-b border-white/5 pb-2">
                <div>
                  <span className="text-[9px] text-text-dark uppercase block">Mã kích hoạt lõi</span>
                  <strong className="text-sm font-heading font-black text-primary-cyan tracking-wider uppercase bg-primary-cyan/5 border border-primary-cyan/20 px-2 py-0.5 rounded-sm">
                    {v.code}
                  </strong>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-bold">
                  {v.discount_type === "PERCENT" ? (
                    <span className="flex items-center gap-0.5 text-purple-400"><Percent className="w-3 h-3" /> PERCENT</span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-primary-neon"><DollarSign className="w-3 h-3" /> FIXED VALUE</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-grow">
                <p className="text-text-muted text-[11px] leading-tight font-body h-8 line-clamp-2">
                  {v.description || "Chưa nạp bản mô tả thuộc tính cho phễu ưu đãi này."}
                </p>
                
                <div className="grid grid-cols-2 gap-2 border-t border-white/2 pt-2 text-[10px] text-text-dark uppercase">
                  <div>
                    <span>Hàm lượng giảm:</span>
                    <strong className="block text-text-pure text-xs mt-0.5">
                      {v.discount_type === "PERCENT" ? `${v.discount_value}%` : formatVND(v.discount_value)}
                    </strong>
                  </div>
                  <div>
                    <span>Ngưỡng sàn đơn:</span>
                    <strong className="block text-text-pure text-xs mt-0.5">{formatVND(v.min_subtotal)}</strong>
                  </div>
                </div>
              </div>

              {/* THỜI HẠN VÀ KHỐI THAO TÁC CỦA ADMIN */}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px]">
                <span className="text-text-dark flex items-center gap-1 uppercase">
                  <Calendar className="w-3.5 h-3.5 text-text-dark" /> Hạn: {new Date(v.expiry_date).toLocaleDateString("vi-VN")}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(v)} className="p-1 border border-white/10 hover:border-primary-cyan text-text-dark hover:text-primary-cyan transition-colors cursor-pointer" title="Hiệu chỉnh thông số">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => { if (confirm(`Xác nhận xóa bỏ vĩnh viễn phễu ưu đãi [${v.code}] khỏi trục màng hệ thống?`)) deleteVoucherMutation.mutate(v.code); }}
                    disabled={deleteVoucherMutation.isPending}
                    className="p-1 border border-white/10 hover:border-red-500 text-text-dark hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40" 
                    title="Xóa mã"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* EDIT/CREATE POP-UP MODAL FRAME COIL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#090d16] border border-white/10 p-6 flex flex-col gap-5 relative shadow-[0_0_40px_rgba(0,0,0,0.9)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-dark hover:text-text-pure transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-2">
              <h3 className="text-xs font-heading font-black uppercase text-text-pure tracking-widest">
                {editingVoucherId ? `CẬP NHẬT THÔNG SỐ VOUCHER: ${editingVoucherId}` : "KHỞI TẠO PHỄU ƯU ĐÃI MỚI THƯỢNG TẦNG"}
              </h3>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveVoucherMutation.mutate(); }} className="flex flex-col gap-4 text-[11px]">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Mã kích hoạt Voucher (Duy nhất, viết hoa)</label>
                <input required type="text" Logan-Secure="true" disabled={!!editingVoucherId} value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="CYBERMUSH10" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-bold tracking-wider disabled:opacity-40 uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase">Hình thức chiết khấu</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value as "PERCENT" | "FIXED", discountValue: 0})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-bold uppercase">
                    <option value="PERCENT">PERCENT (%)</option>
                    <option value="FIXED">FIXED AMOUNT (đ)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase">Hàm lượng giảm giá</label>
                  <input required type="number" min={1} value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-bold text-primary-cyan" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase">Ngưỡng sàn subtotal (VND)</label>
                  <input required type="number" min={0} value={formData.minSubtotal} onChange={(e) => setFormData({...formData, minSubtotal: Number(e.target.value)})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-bold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-dark uppercase">Ngày đóng phễu (Expiry Date)</label>
                  <input required type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="bg-background-dark border border-white/10 p-2 text-text-pure outline-none focus:border-primary-neon font-bold text-xs uppercase" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-dark uppercase">Mô tả thuộc tính ưu đãi công khai</label>
                <textarea required rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Nhập quyền lợi voucher dành cho kỹ sư sàn..." className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon font-body resize-none" />
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-10 border border-white/10 text-text-muted hover:text-text-pure px-4 font-bold uppercase tracking-wider transition-colors cursor-pointer">
                  Hủy lệnh
                </button>
                <button type="submit" disabled={saveVoucherMutation.isPending} className="h-10 bg-primary-cyan text-background-deep px-5 font-bold uppercase tracking-wider hover:bg-primary-neon transition-all flex items-center gap-1.5 cursor-pointer shadow-neon-cyan/10">
                  <Save className="w-4 h-4" /> {saveVoucherMutation.isPending ? "ĐANG LƯU..." : "XÁC LẬP ƯU ĐÃI"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      <div className="text-center text-[9px] text-text-dark uppercase flex items-center justify-center gap-1 border-t border-white/5 pt-4 mt-2">
        <ShieldCheck className="w-3 h-3" /> Cấu trúc phân phối mã giảm giá lượng tử vận hành vô trùng ổn định
      </div>
    </div>
  );
}