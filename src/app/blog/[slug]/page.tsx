"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { BlogDetailHeader } from "@/components/blog/blog-detail-header";
import { BlogStatePanel } from "@/components/blog/blog-state-panel";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { getBlogPost } from "@/features/blog/blog.repository";
import { supabase } from "@/lib/supabaseClient";

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const postQuery = useQuery({ queryKey: ["blog-detail", slug], queryFn: () => getBlogPost(supabase, slug), enabled: Boolean(slug) });

  return (
    <PageWrapper>
      <main className="relative min-h-screen border-b border-white/5 py-10">
        <Container className="max-w-4xl">
          <Link href="/blog" className="group mb-6 inline-flex min-h-11 items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-widest text-text-dark transition-colors hover:text-primary-cyan focus-visible:bio-focus motion-reduce:transition-none"><ChevronLeft aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />[ QUAY LẠI THƯ VIỆN LƯU TRỮ ]</Link>
          {postQuery.isLoading ? <BlogStatePanel kind="LOADING" message="Đang nạp phân khu tri thức lượng tử..." /> : postQuery.isError ? <BlogStatePanel kind="ERROR" message="Không thể tải bài viết lúc này." action={<button type="button" onClick={() => postQuery.refetch()} className="min-h-11 border border-current/30 px-4 font-mono text-xs font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : !postQuery.data ? <BlogStatePanel kind="EMPTY" message="Mã định danh bài viết không tồn tại trên hệ thống." /> : (
            <article className="min-w-0">
              <BlogDetailHeader post={postQuery.data} />
              <div className="mb-8 h-[300px] w-full overflow-hidden border border-white/5 bg-black/40 sm:h-[450px]"><BlogCoverImage src={postQuery.data.coverImage} alt={postQuery.data.title} className="h-full w-full object-cover opacity-75" /></div>
              <div className="flex min-w-0 flex-col gap-4 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-text-muted selection:bg-primary-neon selection:text-background-deep">{postQuery.data.content}</div>
              <div aria-label="Từ khóa bài viết" className="mt-10 flex flex-wrap gap-2 border-t border-white/5 pt-6 font-mono text-[10px]">{postQuery.data.tags.map((tag) => <span key={tag} className="break-words border border-white/10 bg-white/5 px-2.5 py-1 font-bold uppercase text-text-pure">#{tag}</span>)}</div>
            </article>
          )}
        </Container>
      </main>
    </PageWrapper>
  );
}
