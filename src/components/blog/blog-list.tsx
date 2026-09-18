import { BookOpen } from "lucide-react";
import type { BlogPost } from "@/features/blog/blog.types";
import { BlogCard } from "./blog-card";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return <div role="status" className="flex min-h-48 w-full flex-col items-center justify-center gap-2 border border-dashed border-white/10 bg-black/10 p-6 text-center"><BookOpen aria-hidden="true" className="h-8 w-8 text-text-dark opacity-40" /><p className="font-mono text-xs uppercase text-text-dark">Chưa ghi nhận bài viết nào trong danh mục này.</p></div>;
  }
  return <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div>;
}

