"use client";

import React, { useState } from "react";
import Link from "next/link"; // ĐÃ SỬA: Thay thế import sai từ next/navigation sang next/link
import { useQuery } from "@tanstack/react-query";
import { MockDbService, Blog } from "@/services/mockDb"; // Liên thông API mã nguồn
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { BookOpen, Calendar, Clock, Eye, Activity, AlertCircle } from "lucide-react";

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Kích hoạt cổng kéo dữ liệu cẩm nang sinh học bất đồng bộ
  const { data: blogs, isLoading, isError, error } = useQuery<Blog[]>({
    queryKey: ["blog-list"],
    queryFn: async () => MockDbService.getBlogs(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-primary-neon">
        <Activity className="w-4 h-4 animate-spin mr-2" /> Đang bóc tách phân tử dữ liệu tri thức nấm...
      </div>
    );
  }

  if (isError) {
    return (
      <Container className="py-10">
        <div className="border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-2 font-mono text-xs text-red-400 w-full">
          <AlertCircle className="w-4 h-4" /> Lỗi giải mã ma trận tri thức: {error instanceof Error ? error.message : "Xung đột cổng"}
        </div>
      </Container>
    );
  }

  const allBlogs = blogs || [];
  
  // Trích xuất tự động danh sách các thẻ Tags độc bản từ Database
  const allTags = Array.from(new Set(allBlogs.flatMap((b) => b.tags || [])));

  // Lọc bài viết theo Tag được chọn trên Sidebar
  const filteredBlogs = selectedTag
    ? allBlogs.filter((b) => b.tags?.includes(selectedTag))
    : allBlogs;

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-10 border-b border-white/5">
        <Container>
          {/* TIÊU ĐỀ PHÂN HỆ */}
          <div className="flex flex-col gap-2 mb-8 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest">Thư Viện Lưu Trữ Lâm Sàng</span>
            <h1 className="text-3xl font-heading font-black uppercase text-text-pure tracking-tight">Tri Thức Sinh Khối Nấm</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LƯỚI BÀI VIẾT KẾT XUẤT ĐỘNG (9 CỘT) */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              {filteredBlogs.length === 0 ? (
                <div className="w-full py-12 border border-dashed border-white/10 text-center bg-black/10 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-8 h-8 text-text-dark opacity-40" />
                  <p className="font-mono text-xs text-text-dark uppercase">Chưa ghi nhận bài viết nào trong danh mục này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBlogs.map((post) => (
                    <div key={post.id} className="border border-white/5 bg-background-card/20 flex flex-col group hover:border-primary-cyan/30 transition-all duration-200">
                      {/* Ảnh bìa bài viết */}
                      <div className="w-full h-48 bg-black/40 border-b border-white/5 overflow-hidden relative">
                        <img 
                          src={post.coverImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300" 
                        />
                      </div>
                      
                      {/* Khối thông tin ruột */}
                      <div className="p-5 flex flex-col gap-3 flex-grow">
                        <div className="flex items-center gap-3 font-mono text-[10px] text-text-dark uppercase">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.publishedAt}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTimeMinutes} Min</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount}</span>
                        </div>

                        <h3 className="font-heading font-bold text-sm text-text-pure uppercase tracking-wide group-hover:text-primary-cyan transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="font-mono text-xs text-text-muted line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="font-mono text-[10px] text-text-dark uppercase">BY: {post.author.name}</span>
                          {/* ĐÃ SỬA: Sử dụng cấu trúc Next.js Link tối ưu hiệu năng SEO */}
                          <Link href={`/blog/${post.slug}`} className="text-primary-neon hover:underline font-mono text-[11px] font-bold uppercase tracking-wider">
                            ĐỌC LOGS DEEP //
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SIDEBAR LỌC THẺ TAGS ĐỘNG (3 CỘT) */}
            <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24 bg-black/10 border border-white/5 p-4 font-mono text-xs">
              <h4 className="font-heading font-black text-xs text-text-pure uppercase tracking-widest border-b border-white/5 pb-2">
                Màng Lọc Từ Khóa
              </h4>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-2 text-left border uppercase font-bold transition-all text-[10px] cursor-pointer ${
                    selectedTag === null ? "border-primary-neon bg-primary-neon/10 text-primary-neon" : "border-white/5 hover:border-white/10 text-text-dark hover:text-text-pure"
                  }`}
                >
                  ● HIỂN THỊ TẤT CẢ
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-2 text-left border uppercase font-bold transition-all text-[10px] cursor-pointer ${
                      selectedTag === tag ? "border-primary-cyan bg-primary-cyan/10 text-primary-cyan" : "border-white/5 hover:border-white/10 text-text-dark hover:text-text-pure"
                    }`}
                  >
                    # {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}