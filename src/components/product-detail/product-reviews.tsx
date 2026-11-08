"use client";

import type { FormEvent } from "react";
import { MessageSquareText, Send, Star } from "lucide-react";
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
    <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
        <div className="mb-1 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary-neon">Đánh giá đã xác thực</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-text-pure">Ý kiến khách hàng</h2>
          </div>
          <span className="font-mono text-[10px] text-text-dark">{props.reviews.length} phản hồi</span>
        </div>
        {props.reviews.length > 0 ? props.reviews.map((review) => (
          <article key={review.id} className="flex min-w-0 items-start gap-4 rounded-[10px] border border-primary-neon/12 bg-background-dark/30 p-4 sm:p-5">
            <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-neon/35 bg-primary-neon/[0.06] font-mono text-[10px] font-bold uppercase text-primary-neon">{review.userName.substring(0, 2)}</div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <span className="break-words font-heading text-sm font-semibold text-text-pure">{review.userName}</span>
                <time className="shrink-0 font-mono text-[9px] text-text-dark">{review.createdAt}</time>
              </div>
              <span className="flex items-center gap-0.5" aria-label={`${review.rating} trên 5 sao`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} aria-hidden="true" className={`h-3.5 w-3.5 text-status-warning ${index < review.rating ? "fill-current" : "opacity-35"}`} />
                ))}
              </span>
              <p className="break-words text-sm leading-6 text-text-muted">{review.comment}</p>
            </div>
          </article>
        )) : (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-[10px] border border-dashed border-primary-neon/20 bg-background-dark/25 px-5 text-center">
            <MessageSquareText aria-hidden="true" className="h-8 w-8 text-primary-neon" />
            <p className="mt-4 font-heading text-base font-semibold text-text-pure">Chưa có đánh giá</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-text-dark">Hãy là người đầu tiên chia sẻ trải nghiệm về sản phẩm này.</p>
          </div>
        )}
      </div>

      <form onSubmit={props.onSubmit} className="flex min-w-0 flex-col gap-4 rounded-[10px] border border-primary-neon/18 bg-background-dark/35 p-5 lg:col-span-5 sm:p-6">
        <div className="border-b border-primary-neon/10 pb-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary-neon">Phản hồi sản phẩm</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-text-pure">Viết đánh giá</h2>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-muted">
          Tên người đánh giá
          <input required minLength={2} type="text" value={props.reviewerName} onChange={(event) => !props.isUserLoggedIn && props.onReviewerNameChange(event.target.value)} disabled={props.isUserLoggedIn} placeholder="Nhập họ tên" className="min-h-12 min-w-0 rounded-control border border-white/10 bg-background-dark/75 px-4 text-sm font-normal text-text-pure outline-none transition-colors placeholder:text-text-dark/70 hover:border-primary-neon/30 focus-visible:bio-focus disabled:opacity-55" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-muted">
          Mức đánh giá
          <select value={props.reviewRating} onChange={(event) => props.onReviewRatingChange(Number(event.target.value))} className="min-h-12 min-w-0 rounded-control border border-white/10 bg-background-dark/75 px-4 text-sm font-normal text-text-pure outline-none transition-colors hover:border-primary-neon/30 focus-visible:bio-focus">
            <option value={5}>5 sao — Rất tốt</option>
            <option value={4}>4 sao — Tốt</option>
            <option value={3}>3 sao — Bình thường</option>
            <option value={2}>2 sao — Chưa tốt</option>
            <option value={1}>1 sao — Không hài lòng</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-muted">
          Nội dung đánh giá
          <textarea required minLength={3} rows={5} value={props.reviewComment} onChange={(event) => props.onReviewCommentChange(event.target.value)} placeholder="Chia sẻ trải nghiệm của bạn..." className="min-w-0 resize-y rounded-control border border-white/10 bg-background-dark/75 p-4 text-sm leading-6 text-text-pure outline-none transition-colors placeholder:text-text-dark/70 hover:border-primary-neon/30 focus-visible:bio-focus" />
        </label>
        <button type="submit" disabled={props.isPending} aria-busy={props.isPending || undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-primary-neon px-5 font-heading text-sm font-bold text-background-deep shadow-[0_0_24px_rgba(0,245,255,0.18)] transition-colors hover:bg-primary-cyan focus-visible:bio-focus disabled:cursor-wait disabled:opacity-45">
          <Send aria-hidden="true" className="h-4 w-4" />
          {props.isPending ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
}
