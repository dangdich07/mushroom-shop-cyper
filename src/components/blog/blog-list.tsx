import { BookOpen } from "lucide-react";
import type { BlogPost } from "@/features/blog/blog.types";
import { BlogCard } from "./blog-card";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return <div role="status" className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary-cyan/25 bg-surface-glass p-6 text-center"><BookOpen aria-hidden="true" className="h-8 w-8 text-primary-cyan" /><p className="text-sm text-text-dark">Chưa ghi nhận bài viết nào trong danh mục này.</p></div>;
  }
  return <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div>;
}
