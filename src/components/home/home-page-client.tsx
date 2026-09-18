"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Zap, Shield, Award,
  ChevronDown, BookOpen, Clock, Activity, Target
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { HomeCta } from "@/components/home/home-cta";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeHero } from "@/components/home/home-hero";
import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { HomeCategoryCard } from "@/components/home/home-category-card";
import { KnowledgeSection } from "@/components/home/knowledge-section";
import { ProductShowcase } from "@/components/home/product-showcase";
import { ProductCard } from "@/components/product/product-card";
import { TrustStrip } from "@/components/layout/trust-strip";
import { StatePanel } from "@/components/ui/state-panel";
import type { Product } from "@/types/product.types";

// ==========================================
// MOCK DATA CHUẨN PRODUCTION FOR HOME PAGE
// ==========================================
const HOME_CATEGORIES = [
  { id: "cat-1", name: "Nấm Dược Liệu", slug: "MEDICINAL", icon: Activity, desc: "Tối ưu hóa hệ miễn dịch & hoạt chất sinh học trường thọ" },
  { id: "cat-2", name: "Nấm Thực Phẩm", slug: "FOOD", icon: Target, desc: "Nấm tươi hữu cơ thượng hạng cho bữa ăn dinh dưỡng tương lai" },
  { id: "cat-3", name: "Thiết Bị & Phôi Nấm", slug: "EQUIPMENT", icon: Shield, desc: "Hạ tầng nuôi cấy tự động hóa tại gia chuẩn phòng lab" },
] as const;

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

interface HomePageClientProps {
  products: Product[];
  productsLoadError?: boolean;
}

export function HomePageClient({ products, productsLoadError = false }: HomePageClientProps) {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const discountedProducts = useMemo(
    () => products.filter((product) => Boolean(product.compareAtPrice && product.compareAtPrice > product.price)).slice(0, 4),
    [products],
  );
  const featuredProducts = useMemo(() => products.slice(0, 5), [products]);
  const categoryImages = useMemo(() => {
    const images: Partial<Record<Product["category"], string>> = {};
    for (const product of products) {
      if (!images[product.category] && product.image) images[product.category] = product.image;
    }
    return images;
  }, [products]);

  return (
    <PageWrapper>
      <div className="home-bio-shell">
        <HomeHero className="py-3 sm:py-4 lg:py-4">
          <Container wide className="relative z-10">
            <div className="relative isolate grid overflow-hidden rounded-[14px] border border-primary-neon/20 bg-[#041321]/90 shadow-[0_24px_90px_rgba(0,0,0,0.34),0_0_55px_rgba(0,217,255,0.07)] lg:min-h-[34rem] lg:grid-cols-5">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_25%,rgba(0,217,255,0.1),transparent_34%),linear-gradient(110deg,rgba(3,20,34,0.97)_0%,rgba(4,23,39,0.94)_43%,rgba(3,13,25,0.4)_64%)]" />
              <div className="relative z-10 flex min-w-0 flex-col justify-center gap-5 p-6 sm:p-9 lg:col-span-2 lg:p-10 xl:p-11">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/[0.07] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00f5ff] shadow-[0_0_8px_#00F5FF]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-300 sm:text-[10px]">Kỷ Nguyên Dinh Dưỡng Sinh Học 2026</span>
                </div>
                <h1 className="max-w-3xl break-words font-heading text-[clamp(2.75rem,4vw,3.5rem)] font-black leading-[0.98] tracking-[-0.05em] text-[#f8fafc]">
                  Nấm Thượng Hạng<br />
                  <span className="inline-block bg-gradient-to-r from-[#00f5ff] via-cyan-300 to-[#00d9ff] bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(0,245,255,0.22)]">Khởi Nguồn Tương Lai</span>
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300 lg:text-[17px]">
                  Phân phối hệ thống nấm thực phẩm hữu cơ siêu sạch và nấm dược liệu quý hiếm đạt chuẩn kiểm định hoạt chất phòng thí nghiệm tế bào.
                </p>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                  <Link href="/products" className="inline-flex min-h-13 min-w-0 items-center justify-center gap-3 rounded-control border border-[#00f5ff] bg-[#00e7f0] px-6 py-3.5 text-center font-heading text-sm font-bold text-[#03101d] shadow-neon-cyan transition-all duration-300 hover:border-white hover:bg-white focus-visible:bio-focus motion-reduce:transition-none">
                    Khám phá sản phẩm <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/promotions" className="inline-flex min-h-13 min-w-0 items-center justify-center rounded-control border border-cyan-300/55 bg-[#071a2a]/70 px-6 py-3.5 text-center font-heading text-sm font-bold text-[#f8fafc] backdrop-blur-md transition-all duration-300 hover:border-[#00f5ff] hover:text-cyan-300 hover:shadow-neon-cyan focus-visible:bio-focus motion-reduce:transition-none">
                    Xem ưu đãi
                  </Link>
                </div>
                <div aria-hidden="true" className="mt-2 hidden items-center gap-4 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/55 sm:flex">
                  <span className="h-px w-14 bg-primary-neon/55" />
                  Sức khỏe hôm nay, tương lai bền vững
                </div>
              </div>
              <div className="relative min-h-[28rem] overflow-hidden border-t border-primary-neon/15 lg:col-span-3 lg:min-h-0 lg:border-t-0">
                <HomeHeroCarousel />
              </div>
            </div>
          </Container>
        </HomeHero>

        <section className="relative z-20 mt-6 pb-6 sm:mt-8 sm:pb-8">
          <TrustStrip variant="home" />
        </section>

        <CategoryShowcase className="py-9 sm:py-11">
          <Container wide>
            <div className="mb-6 flex flex-col gap-2 sm:mb-7">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-neon">Phân Loại Sinh Học</span>
              <h2 className="font-heading text-3xl font-bold tracking-[-0.035em] text-text-pure sm:text-4xl">Hệ Thống Danh Mục Lõi</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
              {HOME_CATEGORIES.map((category, index) => (
                <HomeCategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  description={category.desc}
                  icon={category.icon}
                  image={categoryImages[category.slug]}
                  index={index + 1}
                />
              ))}
            </div>
          </Container>
        </CategoryShowcase>

        <ProductShowcase tone="catalog" className="py-10 sm:py-12">
          <Container wide>
            <div className="mb-7 flex flex-col gap-4 border-b border-primary-neon/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-neon">Sàn Giao Dịch Vật Phẩm</span>
                <h2 className="font-heading text-3xl font-bold tracking-[-0.035em] text-text-pure sm:text-4xl">Sản Phẩm Tiêu Biểu</h2>
              </div>
              <Link href="/products" className="inline-flex min-h-10 items-center gap-2 font-heading text-sm font-semibold text-primary-neon transition-colors hover:text-text-pure focus-visible:bio-focus">
                Xem tất cả sản phẩm <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {productsLoadError ? (
              <StatePanel tone="error" title="Không thể tải sản phẩm" description="Kết nối danh mục đang tạm gián đoạn." action={<button type="button" onClick={() => router.refresh()} className="min-h-11 border border-current px-4 font-mono text-[10px] font-bold uppercase focus-visible:bio-focus">Thử lại</button>} />
            ) : featuredProducts.length === 0 ? (
              <StatePanel tone="empty" title="Chưa có sản phẩm đang bán" description="Danh mục sẽ hiển thị tại đây khi sản phẩm được mở bán." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {featuredProducts.map((product) => <ProductCard key={product.id} product={product} variant="home" />)}
              </div>
            )}
          </Container>
        </ProductShowcase>
      
      {/* The lower homepage modules remain in the existing content flow. */}

      <ProductShowcase tone="flash" className="py-12 sm:py-16">
        <Container wide>
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <Zap className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
              </div>
              <h2 className="font-heading text-2xl font-bold uppercase text-text-pure sm:text-3xl">Chiến Dịch Hạn Giờ</h2>
            </div>
            <Link href="/promotions" className="inline-flex min-h-11 items-center gap-2 border border-red-500/30 px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-red-400 hover:border-red-400 hover:text-red-300 focus-visible:bio-focus">
              Xem toàn bộ ưu đãi <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
          {productsLoadError ? (
            <StatePanel tone="error" title="Không thể tải ưu đãi" description="Vui lòng thử lại sau." action={<button type="button" onClick={() => router.refresh()} className="min-h-11 border border-current px-4 font-mono text-[10px] font-bold uppercase focus-visible:bio-focus">Thử lại</button>} />
          ) : discountedProducts.length === 0 ? (
            <StatePanel tone="empty" title="Chưa có ưu đãi sản phẩm" description="Các chương trình voucher hiện có vẫn được cập nhật tại Trung tâm ưu đãi." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {discountedProducts.map((product) => <ProductCard key={product.id} product={product} variant="home" />)}
            </div>
          )}
        </Container>
      </ProductShowcase>

      {/* 8. MARKETING BANNER (HIGH TECH DISPLAY) */}
      <KnowledgeSection tone="immersive" className="py-10 sm:py-12">
        <Container>
          <div className="glass-premium relative flex w-full flex-col items-center justify-between gap-8 overflow-hidden rounded-[12px] border-primary-neon/20 p-8 shadow-surface-1 md:flex-row sm:p-12">
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
              <figure key={idx} className="glass-card relative flex min-h-48 flex-col gap-4 rounded-[12px] border-primary-neon/15 p-6 shadow-surface-1">
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
              <div key={idx} className="overflow-hidden rounded-[10px] border border-primary-neon/10 bg-background-card/50 shadow-surface-1 transition-colors duration-300">
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
              <div key={idx} className="glass-card group flex flex-col gap-4 rounded-[12px] border-primary-neon/10 p-6 shadow-surface-1 transition-colors hover:border-primary-neon/30">
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
      </div>
    </PageWrapper>
  );
}
