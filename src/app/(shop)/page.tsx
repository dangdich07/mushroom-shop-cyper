"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Zap, Flame, Shield, Award,
  ChevronDown, BookOpen, Clock, Activity, Target
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeCta } from "@/components/home/home-cta";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeHero } from "@/components/home/home-hero";
import { HomeStats } from "@/components/home/home-stats";
import { KnowledgeSection } from "@/components/home/knowledge-section";
import { ProductShowcase } from "@/components/home/product-showcase";
import { ProductCard } from "@/components/product/product-card";
import { StatePanel } from "@/components/ui/state-panel";
import { getCatalogProducts } from "@/features/catalog/catalogRepository";
import { formatVND } from "@/lib/utils";

// ==========================================
// MOCK DATA CHUẨN PRODUCTION FOR HOME PAGE
// ==========================================
const MOCK_STATS = [
  { value: "99.8%", label: "Độ Tinh Khiết Hoạt Chất", desc: "Kiểm nghiệm HPLC" },
  { value: "15.000+", label: "Phòng Nuôi Cấy Công Nghệ Cao", desc: "Hệ thống khép kín ISO" },
  { value: "48 Giờ", label: "Giao Hàng Kiểm Sốt Nhiệt", desc: "Toàn quốc hỏa tốc" },
  { value: "0% ", label: "Hóa Chất & Chất Bảo Quản", desc: "Hữu cơ nguyên bản" },
];

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Nấm Dược Liệu", count: "Mở danh mục", slug: "MEDICINAL", icon: Activity, desc: "Tối ưu hóa hệ miễn dịch & hoạt chất sinh học trường thọ", gradient: "from-[#8B5CF6] to-[#7C3AED]" },
  { id: "cat-2", name: "Nấm Thực Phẩm", count: "Mở danh mục", slug: "FOOD", icon: Target, desc: "Nấm tươi hữu cơ thượng hạng cho bữa ăn dinh dưỡng tương lai", gradient: "from-[#00F5FF] to-[#00D9FF]" },
  { id: "cat-3", name: "Thiết Bị & Phôi Nấm", count: "Mở danh mục", slug: "EQUIPMENT", icon: Shield, desc: "Hạ tầng nuôi cấy tự động hóa tại gia chuẩn phòng lab", gradient: "from-[#22D3EE] to-[#00F5FF]" },
];

const MOCK_FAQS = [
  { q: "Hàm lượng hoạt chất trong nấm dược liệu được kiểm soát như thế nào?", a: "Toàn bộ các lô nấm Đông Trùng Hạ Thảo và Linh Chi tại CyberMushroom đều trải qua chu kỳ kiểm nghiệm Sắc ký lỏng hiệu năng cao (HPLC) trước khi đóng gói, đảm bảo hàm lượng Cordycepin và Adenosine đạt chứng nhận cao nhất thị trường." },
  { q: "Làm sao bảo quản nấm tươi hữu cơ khi vận chuyển đi tỉnh xa?", a: "Chúng tôi sử dụng giải pháp bọc màng chuyên dụng tích hợp hạt hút ẩm sinh học kết hợp thùng xốp bảo ôn nhiệt độ duy trì từ 2-4°C trong suốt 48 giờ vận chuyển, giữ nguyên độ giòn ngọt và tế bào nấm." },
  { q: "Phôi nấm mua về có dễ chăm sóc không và tỷ lệ ra quả thể là bao nhiêu?", a: "Mỗi phôi nấm công nghệ cao đều được cấy sẵn sợi tơ nấm thuần chủng F1 trên giá thể chuẩn hóa. Bạn chỉ cần quét mã QR trên phôi để kích hoạt chu kỳ phun sương tự động. Tỷ lệ ra quả thể thành công đạt trên 95%." }
];

const MOCK_BLOGS = [
  { slug: "ung-dung-hoat-chat-nam-hau-thu-tai-tao-than-kinh", title: "Ứng dụng hoạt chất sinh học từ Nấm Hầu Thủ trong tái tạo tế bào thần kinh", excerpt: "Các nghiên cứu lâm sàng mới nhất chỉ ra rằng Hericenones và Erinacines trong nấm hầu thủ có khả năng kích thích yếu tố tăng trưởng thần kinh (NGF)...", date: "10.06.2026", readTime: "5 phút đọc" },
  { slug: "cam-nang-thiet-lap-phong-nuoi-dong-trung-ha-thao-iot", title: "Cẩm nang thiết lập phòng nuôi cấy nấm Đông Trùng Hạ Thảo tự động tại gia", excerpt: "Chi tiết các bước tối ưu hóa nhiệt độ, dải ánh sáng xanh và chu kỳ độ ẩm 85% để đạt năng suất sinh khối tối đa chỉ với diện tích 2m2...", date: "08.06.2026", readTime: "8 phút đọc" }
];

const MOCK_TESTIMONIALS = [
  { name: "GS. TS Nguyễn Văn Hùng", role: "Chuyên gia Sinh học Phân tử", content: "Tôi đánh giá rất cao quy trình chuẩn hóa hàm lượng chất của CyberMushroom. Sản phẩm của họ có độ ổn định hoạt chất tương đương dược liệu phòng thí nghiệm." },
  { name: "Chị Minh Thư", role: "Chủ Chuỗi Nhà Hàng Organic Luxury", content: "Nấm mối đen tươi ở đây có chất lượng tế bào hoàn hảo. Khách hàng VIP của chúng tôi phản hồi rất tốt về độ ngọt đậm và mùi hương đặc trưng tự nhiên." }
];

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const productsQuery = useQuery({
    queryKey: ["home-products"],
    queryFn: () => getCatalogProducts({ category: "ALL", search: "", minPrice: 0, maxPrice: 10000000, sort: "NEWEST", page: 1, pageSize: 8 }),
  });
  const products = productsQuery.data?.items ?? [];
  const discountedProducts = products.filter((product) => Boolean(product.compareAtPrice && product.compareAtPrice > product.price)).slice(0, 4);
  const featuredProducts = products.slice(0, 4);

  return (
    <PageWrapper>
      {/* 1. HERO SECTION (HIGH-TECH BANNER) */}
      <HomeHero className="flex min-h-[clamp(38rem,82vh,58rem)] items-center pt-8 sm:pt-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,245,255,0.08),transparent_50%)] pointer-events-none" />
        <Container className="relative z-10 grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-neon/5 border border-primary-neon/20 rounded-none w-fit">
              <span className="w-1.5 h-1.5 bg-primary-neon rounded-none shadow-[0_0_8px_#00F5FF]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary-neon">Kỷ Nguyên Dinh Dưỡng Sinh Học 2026</span>
            </div>
            <h1 className="max-w-4xl break-words font-heading text-[2rem] font-black uppercase leading-[0.98] tracking-[-0.04em] text-text-pure sm:text-[clamp(2.75rem,7vw,4.5rem)]">
              Nấm Thượng Hạng<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-neon via-accent-glow to-secondary-purple neon-text-cyan">Khởi Nguồn Tương Lai</span>
            </h1>
            <p className="text-base sm:text-lg text-text-dark max-w-xl font-body leading-relaxed">
              Phân phối hệ thống nấm thực phẩm hữu cơ siêu sạch và nấm dược liệu quý hiếm đạt chuẩn kiểm định hoạt chất phòng thí nghiệm tế bào.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link href="/products" className="inline-flex min-h-12 min-w-0 items-center justify-center border border-primary-neon bg-primary-neon px-4 py-3.5 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-background-deep shadow-neon-cyan transition-all duration-300 hover:bg-transparent hover:text-primary-neon focus-visible:bio-focus motion-reduce:transition-none sm:px-6 sm:text-xs">
                Vào Trung Tâm Giao Dịch
              </Link>
              <Link href="/promotions" className="glass-premium inline-flex min-h-12 min-w-0 items-center justify-center px-4 py-3.5 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-text-pure transition-all duration-300 hover:border-secondary-purple hover:shadow-neon-purple focus-visible:bio-focus motion-reduce:transition-none sm:px-6 sm:text-xs">
                Nhận Mã Ưu Đãi Đăng Ký
              </Link>
            </div>
          </div>
          {/* Đồ họa trừu tượng cánh nấm phát quang bên phải */}
          <div className="lg:col-span-5 relative hidden lg:flex justify-center items-center">
            <div className="w-[380px] h-[380px] rounded-full border border-primary-neon/20 absolute animate-pulse-slow" />
            <div className="w-[480px] h-[480px] rounded-full border border-secondary-purple/10 absolute rotate-45" />
            <div className="glass-premium group relative flex h-[320px] w-[320px] flex-col overflow-hidden rounded-none border-primary-neon/30 p-6 shadow-surface-2">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary-neon/20 to-transparent" />
              <Flame className="w-8 h-8 text-primary-neon mb-4 animate-bounce motion-reduce:animate-none" />
              <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Sản Phẩm Tiêu Điểm</span>
              <h3 className="text-lg font-heading font-bold text-text-pure mt-1 group-hover:text-primary-neon transition-colors">Đông Trùng Hạ Thảo Sinh Khối F1</h3>
              <p className="text-xs text-text-dark mt-2 font-body">Hàm lượng Cordycepin siêu tới hạn vượt trên 12.5mg/g.</p>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="font-mono text-primary-neon font-bold">{formatVND(1250000)}</span>
                <span className="text-[10px] font-mono bg-white/5 px-2 py-1 text-text-muted">Mã: CORD-01</span>
              </div>
            </div>
          </div>
        </Container>
      </HomeHero>

      {/* 2. STATISTICS SECTION */}
      <HomeStats className="py-9 sm:py-10">
        <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_STATS.map((stat, idx) => (
            <div key={idx} className="flex min-h-28 flex-col justify-center border-l border-primary-neon/25 bg-white/[0.015] py-3 pl-4 pr-3">
              <span className="text-2xl sm:text-3xl font-mono font-black text-text-pure tracking-tight neon-text-cyan">{stat.value}</span>
              <span className="text-xs font-heading font-bold uppercase text-primary-neon mt-1">{stat.label}</span>
              <span className="text-[11px] text-text-dark font-body mt-0.5">{stat.desc}</span>
            </div>
          ))}
        </Container>
      </HomeStats>

      {/* 3. CATEGORIES HUB */}
      <CategoryShowcase className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Phân Loại Sinh Học</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Hệ Thống Danh Mục Lõi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link href={`/products?category=${cat.slug}`} key={cat.id} className="glass-card group relative flex min-h-64 flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-neon/40 hover:shadow-ambient-cyan focus-visible:bio-focus motion-reduce:transform-none motion-reduce:transition-none">
                  <div className={`w-10 h-10 bg-gradient-to-br ${cat.gradient} p-[1px]`}>
                    <div className="w-full h-full bg-background-card flex items-center justify-center">
                      <Icon className="w-5 h-5 text-text-pure group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-text-pure uppercase tracking-wide group-hover:text-primary-neon transition-colors">{cat.name}</h3>
                    <span className="text-[11px] font-mono text-text-dark">{cat.count}</span>
                  </div>
                  <p className="text-xs text-text-dark font-body leading-relaxed">{cat.desc}</p>
                  <div className="mt-auto pt-4 flex items-center text-[11px] font-mono text-primary-neon uppercase tracking-wider gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    Truy cập thiết bị <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </CategoryShowcase>

      {/* 4. FLASH SALE MA TRẬN SỐ */}
      <ProductShowcase tone="flash" className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <Zap className="w-4 h-4 animate-bounce motion-reduce:animate-none" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Chiến Dịch Hạn Giờ</h2>
            </div>
            <Link href="/promotions" className="inline-flex min-h-11 items-center gap-2 border border-red-500/30 px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-red-400 hover:border-red-400 hover:text-red-300 focus-visible:bio-focus">
              Xem toàn bộ ưu đãi <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {productsQuery.isPending ? <StatePanel tone="loading" title="Đang tải ưu đãi" description="Đang đồng bộ sản phẩm có giá ưu đãi." /> : productsQuery.isError ? <StatePanel tone="error" title="Không thể tải ưu đãi" description="Vui lòng thử lại sau." action={<button type="button" onClick={() => void productsQuery.refetch()} className="min-h-11 border border-current px-4 font-mono text-[10px] font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : discountedProducts.length === 0 ? <StatePanel tone="empty" title="Chưa có ưu đãi sản phẩm" description="Các chương trình voucher hiện có vẫn được cập nhật tại Trung tâm ưu đãi." /> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{discountedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
        </Container>
      </ProductShowcase>

      {/* 5, 6, 7. GRID TỔNG HỢP: FEATURED / BEST SELLERS / NEW ARRIVALS */}
      <ProductShowcase tone="catalog" className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Sàn Giao Dịch Vật Phẩm</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Sản Phẩm Tiêu Biểu</h2>
          </div>
          {productsQuery.isPending ? <StatePanel tone="loading" title="Đang tải sản phẩm" description="Đang đồng bộ danh mục mới nhất." /> : productsQuery.isError ? <StatePanel tone="error" title="Không thể tải sản phẩm" description="Kết nối danh mục đang tạm gián đoạn." action={<button type="button" onClick={() => void productsQuery.refetch()} className="min-h-11 border border-current px-4 font-mono text-[10px] font-bold uppercase focus-visible:bio-focus">Thử lại</button>} /> : featuredProducts.length === 0 ? <StatePanel tone="empty" title="Chưa có sản phẩm đang bán" description="Danh mục sẽ hiển thị tại đây khi sản phẩm được mở bán." /> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
        </Container>
      </ProductShowcase>

      {/* 8. MARKETING BANNER (HIGH TECH DISPLAY) */}
      <KnowledgeSection tone="immersive" className="py-10 sm:py-12">
        <Container>
          <div className="w-full p-8 sm:p-12 glass-premium relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-primary-neon/10 to-transparent pointer-events-none" />
            <div className="flex flex-col gap-4 relative z-10 max-w-xl">
              <span className="text-[10px] font-mono text-secondary-purple uppercase tracking-widest font-bold">Chương Trình Đào Tạo Sinh Học</span>
              <h3 className="text-xl sm:text-2xl font-heading font-bold uppercase text-text-pure">Hỗ Trợ Chuyển Giao Công Nghệ Nuôi Nấm Độc Quyền</h3>
              <p className="text-xs sm:text-sm text-text-dark font-body leading-relaxed">
                Nhận ngay tài liệu hướng dẫn vận hành phòng lab vi sinh mini và bộ cảm biến độ ẩm IoT tự động trị giá 1.500.000đ khi đăng ký hóa đơn thiết bị đạt ngưỡng quy định.
              </p>
            </div>
            <Link href="/promotions" className="inline-flex min-h-12 flex-shrink-0 items-center justify-center border border-secondary-purple bg-transparent px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-text-pure shadow-neon-purple transition-all duration-300 hover:bg-secondary-purple focus-visible:bio-focus motion-reduce:transition-none">
              Kích Hoạt Gói Hỗ Trợ
            </Link>
          </div>
        </Container>
      </KnowledgeSection>

      {/* 10. TESTIMONIALS */}
      <KnowledgeSection tone="muted" className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-2 mb-10 text-center">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Hội Đồng Đánh Giá</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Phản Hồi Từ Chuyên Gia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_TESTIMONIALS.map((test, idx) => (
              <figure key={idx} className="glass-card relative flex min-h-48 flex-col gap-4 p-6">
                <span className="text-4xl font-serif text-primary-neon/20 absolute top-4 left-4">“</span>
                <blockquote className="relative z-10 pl-4 font-body text-sm italic leading-relaxed text-text-muted">{test.content}</blockquote>
                <figcaption className="mt-auto flex flex-col border-t border-white/5 pt-4">
                  <span className="font-heading font-bold text-sm text-text-pure uppercase tracking-wide">{test.name}</span>
                  <span className="text-xs text-primary-neon font-mono">{test.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </KnowledgeSection>

      {/* 11. FAQ ACCORDION */}
      <HomeFaq className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-2 mb-10 text-center">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Trung Tâm Giải Đáp</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Câu Hỏi Thường Gặp</h2>
          </div>
          <div className="flex flex-col gap-4">
            {MOCK_FAQS.map((faq, idx) => (
              <div key={idx} className="border border-white/5 bg-background-card/50 overflow-hidden transition-colors duration-300">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  type="button"
                  aria-expanded={activeFaq === idx}
                  aria-controls={`home-faq-panel-${idx}`}
                  id={`home-faq-trigger-${idx}`}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 p-5 text-left font-heading text-sm font-bold uppercase tracking-wide text-text-pure transition-colors hover:text-primary-neon focus-visible:bio-focus sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-dark transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-primary-neon" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      id={`home-faq-panel-${idx}`}
                      role="region"
                      aria-labelledby={`home-faq-trigger-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-5 pt-0 text-xs sm:text-sm text-text-dark font-body border-t border-white/5 leading-relaxed bg-black/10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Container>
      </HomeFaq>

      {/* 12. BLOG PREVIEW */}
      <KnowledgeSection tone="muted" className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Cập Nhật Nghiên Cứu</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Tri Thức & Nghiên Cứu Sinh Học</h2>
            </div>
            <Link href="/blog" className="flex min-h-11 items-center gap-1 font-mono text-xs uppercase tracking-widest text-primary-neon transition-transform hover:translate-x-1 focus-visible:bio-focus motion-reduce:transform-none motion-reduce:transition-none">
              Xem Tất Cả Bài Viết <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_BLOGS.map((blog, idx) => (
              <div key={idx} className="glass-card p-6 flex flex-col gap-4 group hover:border-primary-neon/20 transition-colors">
                <div className="flex items-center gap-4 text-[11px] font-mono text-text-dark">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.date}</div>
                  <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {blog.readTime}</div>
                </div>
                <h3 className="font-heading font-bold text-base text-text-pure uppercase tracking-wide group-hover:text-primary-neon transition-colors line-clamp-1">{blog.title}</h3>
                <p className="text-xs text-text-dark font-body leading-relaxed line-clamp-2">{blog.excerpt}</p>
                <Link href={`/blog/${blog.slug}`} className="mt-2 inline-flex min-h-10 w-fit items-center border-b border-white/10 pb-1 font-mono text-[11px] uppercase tracking-widest text-text-pure transition-colors group-hover:border-primary-neon group-hover:text-primary-neon focus-visible:bio-focus">
                  Đọc Học Thuyết Chi Tiết
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </KnowledgeSection>

      {/* 14. CTA SECTION */}
      <HomeCta className="py-16 sm:py-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary-neon/5 rounded-full blur-[120px] pointer-events-none" />
        <Container className="max-w-3xl relative z-10 flex flex-col items-center gap-6">
          <Award className="w-10 h-10 text-primary-neon animate-pulse motion-reduce:animate-none" />
          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-text-pure tracking-tight">
            SẴN SÀNG NÂNG CẤP <span className="text-primary-neon neon-text-cyan">HỆ GEN DINH DƯỠNG?</span>
          </h2>
          <p className="text-sm sm:text-base text-text-dark font-body max-w-xl leading-relaxed">
            Gia nhập cộng đồng ứng dụng nấm công nghệ cao ngay hôm nay để nhận thông báo phân tích hoạt chất định kỳ và các đợt phát hành phôi hiếm.
          </p>
          <Link href="/products" className="mt-2 inline-flex min-h-12 items-center justify-center border border-primary-neon bg-primary-neon px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-background-deep shadow-neon-cyan transition-all duration-300 hover:bg-transparent hover:text-primary-neon focus-visible:bio-focus motion-reduce:transition-none">
            Khởi Động Giao Dịch Đầu Tiên
          </Link>
        </Container>
      </HomeCta>
    </PageWrapper>
  );
}
