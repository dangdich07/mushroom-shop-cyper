"use client";

import type { FormEvent } from "react";
import type { ProductDetailReview } from "./product-detail.types";

interface ProductReviewsProps {
  reviews: ProductDetailReview[];
  reviewerName: string;
  reviewComment: string;
  reviewRating: number;
  isUserLoggedIn: boolean;
  isPending: boolean;
  onReviewerNameChange: (value: string) => void;
  onReviewCommentChange: (value: string) => void;
  onReviewRatingChange: (value: number) => void;
  onSubmit: (event: FormEvent) => void;
}

export function ProductReviews(props: ProductReviewsProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        {props.reviews.length > 0 ? props.reviews.map((review) => (
          <article key={review.id} className="flex min-w-0 items-start gap-4 border border-white/5 bg-black/10 p-4">
            <div aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-neon bg-primary-neon/5 text-[10px] font-bold uppercase text-primary-neon">{review.userName.substring(0, 2)}</div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="break-words text-[11px] font-bold uppercase tracking-wide text-text-pure">{review.userName}</span>
                <time className="shrink-0 text-[10px] text-text-dark">{review.createdAt}</time>
              </div>
              <p className="break-words font-sans text-xs text-text-muted">{review.comment}</p>
            </div>
          </article>
        )) : <p className="text-[11px] italic text-text-dark">Chưa ghi nhận bản báo cáo kiểm định lâm sàng nào.</p>}
      </div>

      <form onSubmit={props.onSubmit} className="flex min-w-0 flex-col gap-4 border border-white/5 bg-black/20 p-5 lg:col-span-5">
        <h4 className="break-words border-b border-white/5 pb-2 font-bold uppercase tracking-widest text-text-pure">Nạp Báo Cáo Khảo Sát</h4>
        <label className="flex flex-col gap-1.5 text-[10px] uppercase text-text-dark">
          Kỹ sư kiểm định thực hiện
          <input type="text" value={props.reviewerName} onChange={(event) => !props.isUserLoggedIn && props.onReviewerNameChange(event.target.value)} disabled={props.isUserLoggedIn} placeholder="Họ tên kỹ sư..." className="min-w-0 border border-white/10 bg-background-dark p-3 font-bold uppercase tracking-wider text-text-pure outline-none focus-visible:bio-focus disabled:opacity-40" />
        </label>
        <label className="flex flex-col gap-1.5 text-[10px] uppercase text-text-dark">
          Hàm lượng đánh giá chuyên môn
          <select value={props.reviewRating} onChange={(event) => props.onReviewRatingChange(Number(event.target.value))} className="min-w-0 border border-white/10 bg-background-dark p-3 font-bold text-text-pure outline-none focus-visible:bio-focus">
            <option value={5}>⭐⭐⭐⭐ Serology 5/5 (Tối Hảo)</option>
            <option value={4}>⭐⭐⭐⭐ Serology 4/5 (Đạt Chuẩn)</option>
            <option value={3}>⭐⭐⭐ Serology 3/5 (Trung Tính)</option>
            <option value={2}>⭐⭐ Serology 2/5 (Kém Kích Ứng)</option>
            <option value={1}>⭐ Serology 1/5 (Đột Biến Lỗi)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[10px] uppercase text-text-dark">
          Nội dung báo cáo chi tiết
          <textarea rows={4} value={props.reviewComment} onChange={(event) => props.onReviewCommentChange(event.target.value)} placeholder="Nhập kết quả khảo sát lâm sàng..." className="min-w-0 resize-none border border-white/10 bg-background-dark p-3 font-sans text-xs text-text-pure outline-none focus-visible:bio-focus" />
        </label>
        <button type="submit" disabled={props.isPending} aria-busy={props.isPending || undefined} className="min-h-11 bg-primary-neon font-bold uppercase tracking-wider text-background-deep hover:bg-primary-cyan focus-visible:bio-focus disabled:opacity-40">{props.isPending ? "ĐANG ĐỒNG BỘ..." : "GỬI BÁO CÁO CÔNG KHAI"}</button>
      </form>
    </div>
  );
}
