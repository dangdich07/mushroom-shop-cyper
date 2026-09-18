import { Calendar, Clock, Eye, User } from "lucide-react";
import type { BlogPost } from "@/features/blog/blog.types";

export function BlogDetailHeader({ post }: { post: BlogPost }) {
  return (
    <header className="mb-8 flex min-w-0 flex-col gap-4 border-b border-white/5 pb-6">
      <h1 className="break-words font-heading text-2xl font-black uppercase leading-tight tracking-tight text-text-pure sm:text-4xl">{post.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-wide text-text-dark">
        <span className="flex min-w-0 items-center gap-1 break-words text-primary-cyan"><User aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />TÁC GIẢ: {post.author.name} ({post.author.role})</span>
        <span className="flex items-center gap-1"><Calendar aria-hidden="true" className="h-3.5 w-3.5" />NGÀY: {post.publishedAt}</span>
        <span className="flex items-center gap-1"><Clock aria-hidden="true" className="h-3.5 w-3.5" />THỜI GIAN ĐỌC: {post.readTimeMinutes} PHÚT</span>
        <span className="flex items-center gap-1"><Eye aria-hidden="true" className="h-3.5 w-3.5" />LƯỢT XEM: {post.viewCount}</span>
      </div>
    </header>
  );
}

