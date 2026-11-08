"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
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
      <div className="relative isolate min-h-screen min-w-0 overflow-x-clip border-b border-primary-cyan/10 bg-background-deep py-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,210,230,0.1),transparent_50%),linear-gradient(rgba(0,210,230,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,230,0.025)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
        <Container wide>
          <header className="relative mb-4 overflow-hidden rounded-xl border border-primary-cyan/20 bg-surface-glass px-4 pb-4 sm:px-5">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/catalog-lingzhi-lab.webp')] bg-cover bg-right opacity-[0.1]" />
            <nav aria-label="Điều hướng phân cấp" className="relative flex min-h-11 flex-wrap items-center gap-2 text-xs text-text-dark">
              <Link href="/" className="inline-flex min-h-11 items-center gap-2 hover:text-primary-cyan focus-visible:bio-focus"><Home aria-hidden="true" className="h-3.5 w-3.5" />Trang chủ</Link>
              <ChevronRight aria-hidden="true" className="h-3 w-3" /><span aria-current="page" className="text-primary-cyan">Thư viện tri thức</span>
            </nav>
            <h1 className="relative break-words font-heading text-[clamp(26px,3vw,36px)] font-bold leading-tight tracking-tight text-text-pure">Thư viện tri thức <span className="text-primary-cyan">nấm</span></h1>
            <p className="relative mt-2 max-w-2xl text-sm leading-6 text-text-muted">Khám phá thế giới nấm qua kiến thức dinh dưỡng, nghiên cứu và những câu chuyện từ CyberMushroom.</p>
          </header>
          {blogsQuery.isLoading ? <BlogStatePanel kind="LOADING" message="Đang bóc tách phân tử dữ liệu tri thức nấm..." /> : blogsQuery.isError ? <BlogStatePanel kind="ERROR" message="Không thể tải thư viện tri thức lúc này." action={<button type="button" onClick={() => blogsQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : blogs.length === 0 ? <BlogStatePanel kind="EMPTY" message="Chưa ghi nhận bài viết nào trong thư viện." /> : (
            <div className="flex min-w-0 flex-col gap-4">
              {filteredBlogs.length > 0 && <BlogCard post={filteredBlogs[0]} featured />}
              <BlogFilter tags={tags} selectedTag={selectedTag} onChange={setSelectedTag} />
              {(filteredBlogs.length === 0 || filteredBlogs.length > 1) && <BlogList posts={filteredBlogs.slice(1)} />}
            </div>
          )}
        </Container>
      </div>
    </PageWrapper>
  );
}
