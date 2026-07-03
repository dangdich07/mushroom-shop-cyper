"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Zap, Star, Flame, Shield, Award, 
  ChevronDown, BookOpen, Clock, Activity, Target
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
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
  { id: "cat-1", name: "Nấm Dược Liệu", count: "12 Sản phẩm", slug: "MEDICINAL", icon: Activity, desc: "Tối ưu hóa hệ miễn dịch & hoạt chất sinh học trường thọ", gradient: "from-[#8B5CF6] to-[#7C3AED]" },
  { id: "cat-2", name: "Nấm Thực Phẩm", count: "24 Sản phẩm", slug: "FOOD", icon: Target, desc: "Nấm tươi hữu cơ thượng hạng cho bữa ăn dinh dưỡng tương lai", gradient: "from-[#00F5FF] to-[#00D9FF]" },
  { id: "cat-3", name: "Thiết Bị & Phôi Nấm", count: "8 Sản phẩm", slug: "EQUIPMENT", icon: Shield, desc: "Hạ tầng nuôi cấy tự động hóa tại gia chuẩn phòng lab", gradient: "from-[#22D3EE] to-[#00F5FF]" },
];

const MOCK_PRODUCTS = [
  { id: "p-1", name: "Đông Trùng Hạ Thảo Cordyceps Militaris", category: "MEDICINAL", price: 1250000, oldPrice: 1500000, rating: 4.9, reviews: 128, tag: "Best Seller", image: "https://images.unsplash.com/photo-1511202642005-cb62f7f3f1e9?q=80&w=600&auto=format&fit=crop", sku: "MUSH-CORD-01" },
  { id: "p-2", name: "Nấm Linh Chi Đỏ Cắt Lát Cao Cấp", category: "MEDICINAL", price: 850000, oldPrice: 950000, rating: 4.8, reviews: 94, tag: "Flash Sale", image: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?q=80&w=600&auto=format&fit=crop", sku: "MUSH-REI-02" },
  { id: "p-3", name: "Nấm Mối Đen Hữu Cơ Tươi Hộp Premium", category: "FOOD", price: 240000, rating: 5.0, reviews: 210, tag: "New Arrival", image: "https://images.unsplash.com/photo-1570714061093-d40b57b9e115?q=80&w=600&auto=format&fit=crop", sku: "MUSH-TERM-03" },
  { id: "p-4", name: "Phôi Nấm Hầu Thủ Thủy Canh Tự Động", category: "EQUIPMENT", price: 350000, rating: 4.7, reviews: 45, tag: "Trending", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop", sku: "MUSH-LION-04" },
];

const MOCK_FAQS = [
  { q: "Hàm lượng hoạt chất trong nấm dược liệu được kiểm soát như thế nào?", a: "Toàn bộ các lô nấm Đông Trùng Hạ Thảo và Linh Chi tại CyberMushroom đều trải qua chu kỳ kiểm nghiệm Sắc ký lỏng hiệu năng cao (HPLC) trước khi đóng gói, đảm bảo hàm lượng Cordycepin và Adenosine đạt chứng nhận cao nhất thị trường." },
  { q: "Làm sao bảo quản nấm tươi hữu cơ khi vận chuyển đi tỉnh xa?", a: "Chúng tôi sử dụng giải pháp bọc màng chuyên dụng tích hợp hạt hút ẩm sinh học kết hợp thùng xốp bảo ôn nhiệt độ duy trì từ 2-4°C trong suốt 48 giờ vận chuyển, giữ nguyên độ giòn ngọt và tế bào nấm." },
  { q: "Phôi nấm mua về có dễ chăm sóc không và tỷ lệ ra quả thể là bao nhiêu?", a: "Mỗi phôi nấm công nghệ cao đều được cấy sẵn sợi tơ nấm thuần chủng F1 trên giá thể chuẩn hóa. Bạn chỉ cần quét mã QR trên phôi để kích hoạt chu kỳ phun sương tự động. Tỷ lệ ra quả thể thành công đạt trên 95%." }
];

const MOCK_BLOGS = [
  { title: "Ứng dụng hoạt chất sinh học từ Nấm Hầu Thủ trong tái tạo tế bào thần kinh", excerpt: "Các nghiên cứu lâm sàng mới nhất chỉ ra rằng Hericenones và Erinacines trong nấm hầu thủ có khả năng kích thích yếu tố tăng trưởng thần kinh (NGF)...", date: "10.06.2026", readTime: "5 phút đọc" },
  { title: "Cẩm nang thiết lập phòng nuôi cấy nấm Đông Trùng Hạ Thảo tự động tại gia", excerpt: "Chi tiết các bước tối ưu hóa nhiệt độ, dải ánh sáng xanh và chu kỳ độ ẩm 85% để đạt năng suất sinh khối tối đa chỉ với diện tích 2m2...", date: "08.06.2026", readTime: "8 phút đọc" }
];

const MOCK_TESTIMONIALS = [
  { name: "GS. TS Nguyễn Văn Hùng", role: "Chuyên gia Sinh học Phân tử", content: "Tôi đánh giá rất cao quy trình chuẩn hóa hàm lượng chất của CyberMushroom. Sản phẩm của họ có độ ổn định hoạt chất tương đương dược liệu phòng thí nghiệm." },
  { name: "Chị Minh Thư", role: "Chủ Chuỗi Nhà Hàng Organic Luxury", content: "Nấm mối đen tươi ở đây có chất lượng tế bào hoàn hảo. Khách hàng VIP của chúng tôi phản hồi rất tốt về độ ngọt đậm và mùi hương đặc trưng tự nhiên." }
];

export default function HomePage() {
  // Trạng thái đếm ngược Flash Sale thời gian thực
  const [countdown, setCountdown] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageWrapper>
      {/* 1. HERO SECTION (HIGH-TECH BANNER) */}
      <section className="relative min-h-[90vh] flex items-center pt-12 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,245,255,0.08),transparent_50%)] pointer-events-none" />
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-12">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-neon/5 border border-primary-neon/20 rounded-none w-fit">
              <span className="w-1.5 h-1.5 bg-primary-neon rounded-none shadow-[0_0_8px_#00F5FF]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary-neon">Kỷ Nguyên Dinh Dưỡng Sinh Học 2026</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase tracking-tight text-text-pure leading-tight">
              Nấm Thượng Hạng<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-neon via-accent-glow to-secondary-purple neon-text-cyan">Khởi Nguồn Tương Lai</span>
            </h1>
            <p className="text-base sm:text-lg text-text-dark max-w-xl font-body leading-relaxed">
              Phân phối hệ thống nấm thực phẩm hữu cơ siêu sạch và nấm dược liệu quý hiếm đạt chuẩn kiểm định hoạt chất phòng thí nghiệm tế bào.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link href="/products" className="px-6 py-3.5 bg-primary-neon text-background-deep font-mono font-bold text-xs uppercase tracking-wider border border-primary-neon shadow-neon-cyan hover:bg-transparent hover:text-primary-neon transition-all duration-300">
                Vào Trung Tâm Giao Dịch
              </Link>
              <Link href="/promotions" className="px-6 py-3.5 glass-premium text-text-pure font-mono font-bold text-xs uppercase tracking-wider hover:border-secondary-purple hover:shadow-neon-purple transition-all duration-300">
                Nhận Mã Ưu Đãi Đăng Ký
              </Link>
            </div>
          </div>
          {/* Đồ họa trừu tượng cánh nấm phát quang bên phải */}
          <div className="lg:col-span-5 relative hidden lg:flex justify-center items-center">
            <div className="w-[380px] h-[380px] rounded-full border border-primary-neon/20 absolute animate-pulse-slow" />
            <div className="w-[480px] h-[480px] rounded-full border border-secondary-purple/10 absolute rotate-45" />
            <div className="w-[320px] h-[320px] glass-premium rounded-none border-primary-neon/30 flex flex-col p-6 relative shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary-neon/20 to-transparent" />
              <Flame className="w-8 h-8 text-primary-neon mb-4 animate-bounce" />
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
      </section>

      {/* 2. STATISTICS SECTION */}
      <section className="bg-background-dark/50 py-10 border-b border-white/5 relative z-10">
        <Container className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col border-l border-primary-neon/20 pl-4">
              <span className="text-2xl sm:text-3xl font-mono font-black text-text-pure tracking-tight neon-text-cyan">{stat.value}</span>
              <span className="text-xs font-heading font-bold uppercase text-primary-neon mt-1">{stat.label}</span>
              <span className="text-[11px] text-text-dark font-body mt-0.5">{stat.desc}</span>
            </div>
          ))}
        </Container>
      </section>

      {/* 3. CATEGORIES HUB */}
      <section className="py-16 relative z-10 border-b border-white/5">
        <Container>
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Phân Loại Sinh Học</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Hệ Thống Danh Mục Lõi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link href={`/products?category=${cat.slug}`} key={cat.id} className="glass-card p-6 flex flex-col gap-4 relative group hover:border-primary-neon/40 transition-all duration-300">
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
      </section>

      {/* 4. FLASH SALE MA TRẬN SỐ */}
      <section className="py-16 bg-background-dark/30 border-b border-white/5 relative z-10">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <Zap className="w-4 h-4 animate-bounce" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Chiến Dịch Hạn Giờ</h2>
            </div>
            {/* Đồng hồ đếm ngược công nghệ */}
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-text-dark uppercase tracking-widest mr-2 hidden sm:inline">Thời gian còn lại:</span>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-primary-neon font-bold shadow-neon-cyan">{String(countdown.hours).padStart(2, "0")}h</div>
              <span className="text-text-dark">:</span>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-primary-neon font-bold shadow-neon-cyan">{String(countdown.minutes).padStart(2, "0")}m</div>
              <span className="text-text-dark">:</span>
              <div className="bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-red-500 border-red-500/20 font-bold">{String(countdown.seconds).padStart(2, "0")}s</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.slice(0, 2).map((prod) => (
              <div key={prod.id} className="glass-premium p-4 flex flex-col gap-3 relative group">
                <div className="absolute top-3 left-3 z-20 bg-red-500 text-background-deep font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                  -15% GIẢM
                </div>
                <div className="w-full aspect-square bg-background-dark overflow-hidden relative border border-white/5">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] font-mono text-text-dark tracking-wider uppercase">{prod.sku}</span>
                  <h3 className="font-heading font-bold text-sm text-text-pure uppercase tracking-wide line-clamp-1 group-hover:text-primary-neon transition-colors">{prod.name}</h3>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-primary-neon font-bold">{formatVND(prod.price)}</span>
                    {prod.oldPrice && <span className="font-mono text-[11px] text-text-dark line-through">{formatVND(prod.oldPrice)}</span>}
                  </div>
                  <button className="px-3 py-1.5 bg-primary-neon text-background-deep font-mono font-bold text-[10px] uppercase border border-primary-neon hover:bg-transparent hover:text-primary-neon transition-colors cursor-pointer">
                    Mua Ngay
                  </button>
                </div>
              </div>
            ))}
            {/* Giả lập hai khung xương/Skeletons tải dữ liệu hoặc card trống cho đúng quy mô ma trận */}
            <div className="glass-card p-4 flex flex-col justify-center items-center text-center opacity-40 border-dashed border-white/10">
              <Clock className="w-8 h-8 text-text-dark mb-2 animate-spin" />
              <span className="font-mono text-[10px] uppercase text-text-dark tracking-widest">Đang cập nhật mã tiếp theo...</span>
            </div>
            <div className="glass-card p-4 flex flex-col justify-center items-center text-center opacity-40 border-dashed border-white/10">
              <Clock className="w-8 h-8 text-text-dark mb-2 animate-spin" />
              <span className="font-mono text-[10px] uppercase text-text-dark tracking-widest">Đang cập nhật mã tiếp theo...</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 5, 6, 7. GRID TỔNG HỢP: FEATURED / BEST SELLERS / NEW ARRIVALS */}
      <section className="py-16 relative z-10 border-b border-white/5">
        <Container>
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Sàn Giao Dịch Vật Phẩm</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Sản Phẩm Tiêu Biểu</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map((prod) => (
              <div key={prod.id} className="glass-card p-4 flex flex-col gap-3 relative group hover:border-white/10 transition-all duration-300">
                {prod.tag && (
                  <div className="absolute top-3 left-3 z-20 bg-primary-neon text-background-deep font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    {prod.tag}
                  </div>
                )}
                <div className="w-full aspect-square bg-background-dark overflow-hidden relative border border-white/5">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-mono text-[11px] font-bold">{prod.rating}</span>
                    <span className="text-[10px] text-text-dark">({prod.reviews})</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-text-pure uppercase tracking-wide line-clamp-1 group-hover:text-primary-neon transition-colors">{prod.name}</h3>
                </div>
                <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-sm text-text-pure font-bold">{formatVND(prod.price)}</span>
                  <button className="p-2 border border-white/10 text-text-muted hover:text-primary-neon hover:border-primary-neon transition-colors cursor-pointer">
                    + Giỏ Hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. MARKETING BANNER (HIGH TECH DISPLAY) */}
      <section className="py-12 relative z-10 border-b border-white/5">
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
            <Link href="/promotions" className="px-6 py-4 bg-transparent border border-secondary-purple text-text-pure font-mono font-bold text-xs uppercase tracking-wider shadow-neon-purple hover:bg-secondary-purple transition-all duration-300 flex-shrink-0">
              Kích Hoạt Gói Hỗ Trợ
            </Link>
          </div>
        </Container>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="py-16 bg-background-dark/20 border-b border-white/5 relative z-10">
        <Container>
          <div className="flex flex-col gap-2 mb-10 text-center">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Hội Đồng Đánh Giá</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Phản Hồi Từ Chuyên Gia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_TESTIMONIALS.map((test, idx) => (
              <div key={idx} className="glass-card p-6 flex flex-col gap-4 relative">
                <span className="text-4xl font-serif text-primary-neon/20 absolute top-4 left-4">“</span>
                <p className="text-sm text-text-muted font-body italic relative z-10 leading-relaxed pl-4">{test.content}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col">
                  <span className="font-heading font-bold text-sm text-text-pure uppercase tracking-wide">{test.name}</span>
                  <span className="text-xs text-primary-neon font-mono">{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section className="py-16 relative z-10 border-b border-white/5">
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
                  className="w-full p-5 flex items-center justify-between text-left font-heading font-bold text-sm sm:text-base text-text-pure uppercase tracking-wide hover:text-primary-neon transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-dark transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-primary-neon" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
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
      </section>

      {/* 12. BLOG PREVIEW */}
      <section className="py-16 bg-background-dark/30 border-b border-white/5 relative z-10">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Cập Nhật Nghiên Cứu</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase text-text-pure">Tri Thức & Nghiên Cứu Sinh Học</h2>
            </div>
            <Link href="/blog" className="text-xs font-mono text-primary-neon uppercase tracking-widest flex items-center gap-1 hover:translate-x-1 transition-transform">
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
                <Link href="/blog" className="text-[11px] font-mono text-text-pure uppercase tracking-widest border-b border-white/10 pb-1 w-fit group-hover:border-primary-neon group-hover:text-primary-neon transition-colors mt-2">
                  Đọc Học Thuyết Chi Tiết
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 14. CTA SECTION */}
      <section className="py-20 relative z-10 overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary-neon/5 rounded-full blur-[120px] pointer-events-none" />
        <Container className="max-w-3xl relative z-10 flex flex-col items-center gap-6">
          <Award className="w-10 h-10 text-primary-neon animate-pulse" />
          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-text-pure tracking-tight">
            SẴN SÀNG NÂNG CẤP <span className="text-primary-neon neon-text-cyan">HỆ GEN DINH DƯỠNG?</span>
          </h2>
          <p className="text-sm sm:text-base text-text-dark font-body max-w-xl leading-relaxed">
            Gia nhập cộng đồng ứng dụng nấm công nghệ cao ngay hôm nay để nhận thông báo phân tích hoạt chất định kỳ và các đợt phát hành phôi hiếm.
          </p>
          <Link href="/products" className="px-8 py-4 bg-primary-neon text-background-deep font-mono font-bold text-xs uppercase tracking-wider border border-primary-neon shadow-neon-cyan hover:bg-transparent hover:text-primary-neon transition-all duration-300 mt-2">
            Khởi Động Giao Dịch Đầu Tiên
          </Link>
        </Container>
      </section>
    </PageWrapper>
  );
}