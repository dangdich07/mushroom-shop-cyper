"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { ProductReview } from "@/types/db.types";
import { MessageSquare, Trash2, Search, Star, Activity, AlertTriangle, ShieldCheck, CheckCircle } from "lucide-react";

// Khai báo mở rộng kiểu dữ liệu liên thông tên nấm từ bảng products
interface ExtendedReview extends ProductReview {
  products: {
    name: string;
  } | null;
}

// Cấu trúc mô tả chính xác hàng dữ liệu Join trả về từ Supabase
interface SupabaseReviewJoinRow {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  products: {
    name: string;
  } | null;
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");

  // 1. TRUY QUẾT MA TRẬN ĐÁNH GIÁ LIÊN THÔNG BẢNG SẢN PHẨM
  const { data: reviews, isLoading, isError, error } = useQuery<ExtendedReview[]>({
    queryKey: ["admin-all-reviews"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("reviews")
        .select(`
          id,
          product_id,
          user_name,
          rating,
          comment,
          is_verified_purchase,
          created_at,
          products ( name )
        `)
        .order("created_at", { ascending: false });

      if (err) throw err;

      // Thực thi ép kiểu dữ liệu trung gian thông minh để triệt hạ hoàn toàn 'any'
      return ((data as unknown as SupabaseReviewJoinRow[]) || []).map((r) => ({
        id: r.id,
        productId: r.product_id,
        userName: r.user_name,
        rating: Number(r.rating),
        comment: r.comment,
        isVerifiedPurchase: r.is_verified_purchase,
        createdAt: new Date(r.created_at).toLocaleDateString("vi-VN"),
        products: r.products
      }));
    }
  });

  // 2. MUTATION: TIÊU HỦY BẢN GHI ĐÁNH GIÁ (KÍCH HOẠT TRIGGER RE-CALCULATE RATING RỜI RẠC)
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error: err } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-reviews"] });
      alert("Hệ thống đã xóa bản ghi kiểm định và tự động tái cấu trúc điểm số sao thương phẩm mẫu vật.");
    }
  });

  const displayReviews = (reviews || []).filter(rev => {
    const matchesRating = ratingFilter === "ALL" || rev.rating === ratingFilter;
    const matchesSearch = rev.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rev.products?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-xs font-mono">
      
      {/* TIÊU ĐỀ PHÂN KHU ĐIỀU HÀNH */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-base font-heading font-black uppercase text-text-pure tracking-widest flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-cyan" /> HỘI ĐỒNG KIỂM DUYỆT BÁO CÁO KHẢO SÁT LÂM SÀNG
        </h1>
        <p className="text-[10px] text-text-dark uppercase tracking-wider">Giám sát hàm lượng đánh giá chuyên môn và thanh lọc các luồng thông tin phản hồi vi phạm sinh học</p>
      </div>

      {/* THANH ĐIỀU HỢP TÌM KIẾM VÀ LỌC THEO SỐ SAO SEROLOGY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full bg-black/20 p-4 border border-white/5">
        <div className="md:col-span-6 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên kỹ sư, nội dung chứng thực hoặc mã nấm..." 
            className="w-full bg-background-dark border border-white/10 p-2.5 pl-9 text-text-pure outline-none focus:border-primary-neon uppercase text-xs"
          />
          <Search className="w-4 h-4 text-text-dark absolute left-3 top-3" />
        </div>
        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-text-dark uppercase shrink-0 text-[10px]">Phân loại Serology:</span>
          <select 
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="w-full bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-neon uppercase text-xs font-bold"
          >
            <option value="ALL">TOÀN BỘ CHỈ SỐ SAO</option>
            <option value={5}>⭐⭐⭐⭐⭐ 5 Sao (Tối Hảo)</option>
            <option value={4}>⭐⭐⭐⭐ 4 Sao (Đạt Chuẩn)</option>
            <option value={3}>⭐⭐⭐ 3 Sao (Trung Tính)</option>
            <option value={2}>⭐⭐ 2 Sao (Kích Ứng)</option>
            <option value={1}>⭐ 1 Sao (Đột Biến Lỗi)</option>
          </select>
        </div>
        <div className="md:col-span-2 text-right text-text-dark text-[10px] uppercase">
          Quét thấy: <strong className="text-text-pure">{displayReviews.length}</strong> logs khớp
        </div>
      </div>

      {/* RẼ NHÁNH RENDER LEDGER REVIEW TRÊN GIAO DIỆN QUẢN TRỊ */}
      <div className="glass-premium p-4 border-white/5 w-full">
        {isLoading ? (
          <div className="text-primary-cyan flex items-center justify-center py-10"><Activity className="w-4 h-4 animate-spin mr-2" /> Đang bóc tách mảng logs đánh giá...</div>
        ) : isError ? (
          <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 text-red-400 w-full"><AlertTriangle className="w-4 h-4" /> LỖI PHÂN RÃ LUỒNG KIỂM DUYỆT: {error instanceof Error ? error.message : "Xung đột"}</div>
        ) : displayReviews.length === 0 ? (
          <p className="text-center text-text-dark uppercase py-8">Không ghi nhận báo cáo khảo sát nào khớp với bộ lọc.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {displayReviews.map((rev) => (
              <div key={rev.id} className="border border-white/5 bg-background-card/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors">
                <div className="flex flex-col gap-1.5 max-w-4xl">
                  
                  {/* METADATA NODE TRÊN CÙNG CỦA REVIEW */}
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                    <span className="font-bold text-text-pure uppercase text-xs bg-white/5 px-2 py-0.5 border border-white/10">{rev.userName}</span>
                    <span className="text-text-dark">{rev.createdAt}</span>
                    <span className="text-text-muted">➔ Chủng loại mẫu vật:</span>
                    <strong className="text-primary-cyan uppercase tracking-wide text-[11px]">{rev.products?.name || "MẪU VẬT ĐÃ TIÊU HỦY"}</strong>
                    {rev.isVerifiedPurchase && (
                      <span className="px-2 py-0.2 border border-primary-neon/20 bg-primary-neon/5 text-primary-neon font-black rounded-full flex items-center gap-1 text-[8px] tracking-widest uppercase">
                        <CheckCircle className="w-2.5 h-2.5 stroke-[3]" /> VERIFIED
                      </span>
                    )}
                  </div>

                  {/* CHỈ SỐ SAO SEROLOGY VÀ COMMENT NỘI DUNG */}
                  <div className="flex items-center gap-1 text-yellow-400 my-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed font-body bg-black/20 p-2.5 border border-white/5 max-w-3xl">
                    {rev.comment}
                  </p>
                </div>

                {/* NÚT THAO TÁC CỦA ADMIN: TIÊU HỦY BẢN GHI VI PHẠM */}
                <button 
                  type="button"
                  disabled={deleteReviewMutation.isPending}
                  onClick={() => { if (confirm("Xác nhận gỡ bỏ hoàn toàn báo cáo kiểm định này? Hành vi này sẽ tự động kích hoạt trigger tính toán lại sao sản phẩm ngoài hệ thống sàn.")) deleteReviewMutation.mutate(rev.id); }}
                  className="h-9 px-3.5 border border-white/10 text-text-dark hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all flex items-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer shrink-0 self-end sm:self-center"
                  title="Xóa đánh giá"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tiêu hủy logs
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-[9px] text-text-dark uppercase flex items-center justify-center gap-1 border-t border-white/5 pt-4">
        <ShieldCheck className="w-3 h-3" /> Màn hình kiểm toán hội đồng đánh giá vô trùng hoàn tất
      </div>
    </div>
  );
}