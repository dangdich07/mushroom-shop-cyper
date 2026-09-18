"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminReviewList } from "@/components/admin/reviews/admin-review-list";
import { AdminReviewsToolbar } from "@/components/admin/reviews/admin-reviews-toolbar";
import { AdminStatePanel } from "@/components/admin/admin-state-panel";
import { Modal } from "@/components/ui/modal";
import { getAdminReviews } from "@/features/admin/reviews/admin-reviews.repository";
import type { AdminReview, AdminReviewRatingFilter } from "@/features/admin/reviews/admin-reviews.types";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";
import { deleteAdminReviewAction } from "./actions";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState<AdminReviewRatingFilter>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const reviewsQuery = useQuery({ queryKey: ["admin-all-reviews"], queryFn: () => getAdminReviews(supabase) });

  const reviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (reviewsQuery.data ?? []).filter((review) => (rating === "ALL" || review.rating === rating) && (!query || review.userName.toLowerCase().includes(query) || review.productName.toLowerCase().includes(query) || review.comment.toLowerCase().includes(query)));
  }, [rating, reviewsQuery.data, search]);

  const closeDelete = useCallback(() => { setDeleteTarget(null); }, []);
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const result = await deleteAdminReviewAction(reviewId);
      if (!result.success) throw new Error(result.error ?? "Không thể xóa đánh giá lúc này.");
    },
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-all-reviews"] });
      addToast({ title: "ĐÃ XÓA ĐÁNH GIÁ", description: "Bản ghi đánh giá đã được gỡ khỏi hệ thống.", type: "SUCCESS" });
    },
    onError: (error: Error) => addToast({ title: "KHÔNG THỂ XÓA", description: error.message, type: "ERROR" }),
  });

  return <div className="flex min-w-0 flex-col gap-6"><AdminPageHeader title="Kiểm duyệt đánh giá" description="Tra cứu phản hồi khách hàng và xử lý bản ghi không phù hợp" /><AdminReviewsToolbar count={reviews.length} rating={rating} search={search} onRatingChange={setRating} onSearchChange={setSearch} />{reviewsQuery.isLoading ? <AdminStatePanel kind="LOADING" message="Đang tải danh sách đánh giá..." /> : reviewsQuery.isError ? <AdminStatePanel kind="ERROR" message="Không thể tải danh sách đánh giá lúc này." action={<button type="button" onClick={() => reviewsQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : reviews.length === 0 ? <AdminStatePanel kind="EMPTY" message="Không tìm thấy đánh giá phù hợp." /> : <AdminReviewList reviews={reviews} pending={deleteMutation.isPending} onDelete={setDeleteTarget} />}<Modal isOpen={Boolean(deleteTarget)} onClose={closeDelete} title="Xác nhận xóa đánh giá"><div className="flex flex-col gap-5"><p>Bạn sắp xóa vĩnh viễn đánh giá của <strong className="text-text-pure">{deleteTarget?.userName}</strong>. Điểm trung bình của sản phẩm sẽ được hệ thống tính lại.</p><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={closeDelete} disabled={deleteMutation.isPending} className="min-h-11 border border-white/10 px-5 font-mono text-xs font-bold uppercase text-text-muted focus-visible:bio-focus">Hủy</button><button type="button" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="min-h-11 bg-red-500 px-5 font-mono text-xs font-black uppercase text-white focus-visible:bio-focus disabled:opacity-50">{deleteMutation.isPending ? "Đang xóa..." : "Xóa đánh giá"}</button></div></div></Modal></div>;
}
