"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MockDbService, Blog } from "@/services/mockDb"; //
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Calendar, Clock, Eye, ChevronLeft, Activity, AlertCircle, User } from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Gọi API trích xuất chi tiết logs cẩm nang tri thức
  const { data: post, isLoading, isError, error } = useQuery<Blog | null>({
    queryKey: ["blog-detail", slug],
    queryFn: async () => {
      if (!slug) return null;
      return MockDbService.getBlogDetail(slug);
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-primary-neon">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Đang nạp phân khu tri thức lượng tử...
      </div>
    );
  }

  if (isError || !post) {
    return (
      <Container className="py-12">
        <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 font-mono text-xs text-red-400 w-full mb-4">
          <AlertCircle className="w-4 h-4" /> {isError ? `Lỗi: ${error?.message}` : "Mã định danh Logs bài viết không tồn tại trên hệ thống."}
        </div>
        <button type="button" onClick={() => router.push("/blog")} className="text-primary-cyan font-mono text-xs flex items-center gap-1 hover:underline cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Quay lại thư viện
        </button>
      </Container>
    );
  }

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-10 border-b border-white/5">
        <Container className="max-w-4xl">
          {/* NÚT ĐIỀU HƯỚNG QUAY LẠI */}
          <button 
            type="button" 
            onClick={() => router.push("/blog")} 
            className="text-text-dark hover:text-primary-cyan font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 mb-6 transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> [ QUAY LẠI THƯ VIỆN LƯU TRỮ ]
          </button>

          {/* KHỐI TIÊU ĐỀ & METADATA BÀI VIẾT */}
          <div className="flex flex-col gap-4 border-b border-white/5 pb-6 mb-8">
            <h1 className="text-2xl sm:text-4xl font-heading font-black uppercase text-text-pure tracking-tight leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-text-dark uppercase tracking-wide">
              <span className="flex items-center gap-1 text-primary-cyan"><User className="w-3.5 h-3.5" /> TAC GIẢ: {post.author.name} ({post.author.role})</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> NGÀY: {post.publishedAt}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> THỜI GIAN ĐỌC: {post.readTimeMinutes} PHÚT</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> LƯỢT XEM: {post.viewCount}</span>
            </div>
          </div>

          {/* BANNER ẢNH CHÍNH BÀI VIẾT */}
          <div className="w-full h-[300px] sm:h-[450px] border border-white/5 bg-black/40 overflow-hidden mb-8">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover opacity-75" />
          </div>

          {/* KHỐI NỘI DUNG CHÍNH (CONTENT STREAM) */}
          <article className="font-mono text-xs text-text-muted leading-relaxed flex flex-col gap-4 whitespace-pre-wrap selection:bg-primary-neon selection:text-background-deep">
            {post.content}
          </article>

          {/* KHỐI THẺ TAGS PHÂN LOẠI DƯỚI ĐÁY */}
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap gap-2 font-mono text-[10px]">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/10 text-text-pure uppercase font-bold">
                #{tag}
              </span>
            ))}
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}