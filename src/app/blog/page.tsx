"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogFilter } from "@/components/blog/blog-filter";
import { BlogList } from "@/components/blog/blog-list";
import { BlogStatePanel } from "@/components/blog/blog-state-panel";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { getBlogPosts } from "@/features/blog/blog.repository";
import { supabase } from "@/lib/supabaseClient";

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const blogsQuery = useQuery({ queryKey: ["blog-list"], queryFn: () => getBlogPosts(supabase) });
  const blogs = useMemo(() => blogsQuery.data ?? [], [blogsQuery.data]);
  const tags = useMemo(() => Array.from(new Set(blogs.flatMap((post) => post.tags))), [blogs]);
  const filteredBlogs = useMemo(() => selectedTag ? blogs.filter((post) => post.tags.includes(selectedTag)) : blogs, [blogs, selectedTag]);

  return (
    <PageWrapper>
      <main className="relative min-h-screen border-b border-white/5 py-10">
        <Container>
          <header className="mb-8 flex flex-col gap-2 border-b border-white/5 pb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary-cyan">Thư Viện Lưu Trữ Lâm Sàng</span>
            <h1 className="break-words font-heading text-3xl font-black uppercase tracking-tight text-text-pure">Tri Thức Sinh Khối Nấm</h1>
          </header>
          {blogsQuery.isLoading ? <BlogStatePanel kind="LOADING" message="Đang bóc tách phân tử dữ liệu tri thức nấm..." /> : blogsQuery.isError ? <BlogStatePanel kind="ERROR" message="Không thể tải thư viện tri thức lúc này." action={<button type="button" onClick={() => blogsQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : blogs.length === 0 ? <BlogStatePanel kind="EMPTY" message="Chưa ghi nhận bài viết nào trong thư viện." /> : (
            <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-9"><BlogList posts={filteredBlogs} /></div>
              <div className="min-w-0 lg:col-span-3"><BlogFilter tags={tags} selectedTag={selectedTag} onChange={setSelectedTag} /></div>
            </div>
          )}
        </Container>
      </main>
    </PageWrapper>
  );
}
