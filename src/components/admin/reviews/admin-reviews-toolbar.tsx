import { Search, Star } from "lucide-react";
import type { AdminReviewRatingFilter } from "@/features/admin/reviews/admin-reviews.types";

interface Props {
  count: number;
  rating: AdminReviewRatingFilter;
  search: string;
  onRatingChange: (rating: AdminReviewRatingFilter) => void;
  onSearchChange: (search: string) => void;
}

export function AdminReviewsToolbar({ count, rating, search, onRatingChange, onSearchChange }: Props) {
  return <div className="grid min-w-0 gap-4 border border-white/5 bg-black/20 p-4 md:grid-cols-[minmax(0,1fr)_minmax(13rem,20rem)_auto] md:items-end"><label className="min-w-0"><span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-text-dark">Tìm đánh giá</span><span className="relative block"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark" /><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tên khách hàng, sản phẩm hoặc nội dung..." className="min-h-12 w-full border border-white/10 bg-background-dark py-2 pl-10 pr-3 font-mono text-xs text-text-pure focus-visible:bio-focus" /></span></label><label><span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-text-dark">Lọc theo điểm</span><span className="relative block"><Star aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-400" /><select value={rating} onChange={(event) => onRatingChange(event.target.value === "ALL" ? "ALL" : Number(event.target.value) as AdminReviewRatingFilter)} className="min-h-12 w-full border border-white/10 bg-background-dark pl-10 pr-3 font-mono text-xs font-bold uppercase text-text-pure focus-visible:bio-focus"><option value="ALL">Tất cả mức sao</option>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} sao</option>)}</select></span></label><p className="pb-3 font-mono text-[10px] uppercase tracking-wider text-text-dark">Hiển thị: <strong className="text-primary-cyan">{count}</strong></p></div>;
}
