import Link from "next/link";
import { ArrowRight, Calendar, Clock, Eye, UserRound } from "lucide-react";
import type { BlogPost } from "@/features/blog/blog.types";
import { BlogCoverImage } from "./blog-cover-image";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`group min-w-0 overflow-hidden rounded-xl border border-primary-cyan/25 bg-surface-glass shadow-[0_8px_28px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-[border-color,box-shadow] hover:border-primary-cyan/55 hover:shadow-[0_0_24px_rgba(0,210,230,0.1)] motion-reduce:transition-none ${featured ? "grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : "flex flex-col"}`}>
      <div className={`relative w-full overflow-hidden border-b border-primary-cyan/15 bg-primary-cyan/5 ${featured ? "h-[200px] md:h-full md:min-h-[230px] md:border-b-0 md:border-r" : "h-[180px]"}`}>
        <BlogCoverImage src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none" />
        {post.tags.length > 0 && <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">{post.tags.slice(0, 3).map((tag) => <span key={tag} className="max-w-full truncate rounded-md border border-cyan-300/40 bg-[#031521]/90 px-2 py-1 text-[11px] text-cyan-100 backdrop-blur-sm">{tag}</span>)}</div>}
      </div>
      <div className="flex min-w-0 flex-grow flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-dark">
          <span className="flex items-center gap-1"><Calendar aria-hidden="true" className="h-3 w-3" />{post.publishedAt}</span>
          <span className="flex items-center gap-1"><Clock aria-hidden="true" className="h-3 w-3" />{post.readTimeMinutes} phút đọc</span>
          <span className="flex items-center gap-1"><Eye aria-hidden="true" className="h-3 w-3" />{post.viewCount}</span>
        </div>
        <h2 className={`line-clamp-2 break-words font-heading font-bold leading-snug text-text-pure transition-colors group-hover:text-primary-cyan motion-reduce:transition-none ${featured ? "text-xl sm:text-2xl" : "text-base"}`}><Link href={`/blog/${post.slug}`} className="rounded-sm focus-visible:bio-focus">{post.title}</Link></h2>
        <p className="line-clamp-3 break-words text-[13px] leading-5 text-text-muted">{post.excerpt}</p>
        <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-primary-cyan/15 pt-3">
          <span className="flex min-w-0 items-center gap-2 text-xs text-text-dark"><UserRound aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-cyan" /><span className="break-words">{post.author.name}</span></span>
          <Link href={`/blog/${post.slug}`} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold focus-visible:bio-focus ${featured ? "bg-primary-neon text-background-deep hover:bg-primary-cyan" : "text-primary-cyan hover:bg-primary-cyan/10"}`}>Đọc bài viết<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </div>
    </article>
  );
}
