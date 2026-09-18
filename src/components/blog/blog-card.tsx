import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";
import type { BlogPost } from "@/features/blog/blog.types";
import { BlogCoverImage } from "./blog-cover-image";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden border border-white/5 bg-background-card/20 transition-colors hover:border-primary-cyan/30 motion-reduce:transition-none">
      <div className="relative h-48 w-full overflow-hidden border-b border-white/5 bg-black/40">
        <BlogCoverImage src={post.coverImage} alt={post.title} className="h-full w-full object-cover opacity-60 transition-[opacity,transform] duration-300 group-hover:scale-105 group-hover:opacity-80 motion-reduce:transform-none motion-reduce:transition-none" />
      </div>
      <div className="flex min-w-0 flex-grow flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase text-text-dark">
          <span className="flex items-center gap-1"><Calendar aria-hidden="true" className="h-3 w-3" />{post.publishedAt}</span>
          <span className="flex items-center gap-1"><Clock aria-hidden="true" className="h-3 w-3" />{post.readTimeMinutes} Min</span>
          <span className="flex items-center gap-1"><Eye aria-hidden="true" className="h-3 w-3" />{post.viewCount}</span>
        </div>
        <h2 className="line-clamp-2 break-words font-heading text-sm font-bold uppercase tracking-wide text-text-pure transition-colors group-hover:text-primary-cyan motion-reduce:transition-none">{post.title}</h2>
        <p className="line-clamp-3 break-words font-mono text-xs leading-relaxed text-text-muted">{post.excerpt}</p>
        <div className="mt-auto flex min-w-0 flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0 break-words font-mono text-[10px] uppercase text-text-dark">BY: {post.author.name}</span>
          <Link href={`/blog/${post.slug}`} className="inline-flex min-h-10 shrink-0 items-center font-mono text-[11px] font-bold uppercase tracking-wider text-primary-neon hover:underline focus-visible:bio-focus">ĐỌC LOGS DEEP //</Link>
        </div>
      </div>
    </article>
  );
}

