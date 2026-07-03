"use client";

import React from "react";
import Link from "next/link";
import { Send, ShieldCheck, Truck, RefreshCcw, Headphones } from "lucide-react";
import { Container } from "./container";

const FOOTER_LINKS = {
  products: {
    title: "Sản phẩm",
    links: [
      { label: "Nấm Linh Chi Thượng Hạng", href: "/products" },
      { label: "Đông Trùng Hạ Thảo Sinh Khối", href: "/products" },
      { label: "Nấm Mối Đen Hữu Cơ", href: "/products" },
      { label: "Phôi Nấm & Thiết Bị Nuôi Cấy", href: "/products" },
    ]
  },
  policies: {
    title: "Chính sách",
    links: [
      { label: "Chính Sách Vận Chuyển Hỏa Tốc", href: "/" },
      { label: "Bảo Hành Sinh Khối Phôi Nấm", href: "/" },
      { label: "Đổi Trả Sản Phẩm Trong 48h", href: "/" },
      { label: "Bảo Mật Thông Tin Khách Hàng", href: "/" },
    ]
  },
  company: {
    title: "Doanh nghiệp",
    links: [
      { label: "Câu Chuyện Về Chúng Tôi", href: "/" },
      { label: "Chứng Nhận Hoạt Chất Sinh Học", href: "/" },
      { label: "Hệ Thống Phòng Thí Nghiệm", href: "/" },
      { label: "Liên Hệ Khách Hàng Doanh Nghiệp", href: "/" },
    ]
  }
};

export function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="w-full bg-background-dark border-t border-white/5 relative z-10 pt-16 pb-8 overflow-hidden">
      {/* Background Decor Element */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-purple/5 rounded-full blur-[150px] pointer-events-none" />

      {/* CORE BENEFITS SECTION */}
      <Container className="grid grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/5 mb-12">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-primary-neon flex-shrink-0" />
          <div>
            <h5 className="font-heading font-bold text-sm uppercase text-text-pure mb-1">100% Hữu Cơ Tuyệt Đối</h5>
            <p className="text-xs text-text-dark font-body">Đạt kiểm định hoạt chất phòng thí nghiệm quốc tế.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="w-6 h-6 text-primary-neon flex-shrink-0" />
          <div>
            <h5 className="font-heading font-bold text-sm uppercase text-text-pure mb-1">Vận Chuyển Kiểm Soát Nhiệt</h5>
            <p className="text-xs text-text-dark font-body">Đảm bảo nấm tươi nguyên vẹn cấu trúc tế bào.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RefreshCcw className="w-6 h-6 text-primary-neon flex-shrink-0" />
          <div>
            <h5 className="font-heading font-bold text-sm uppercase text-text-pure mb-1">Đổi Trả Phôi Lỗi</h5>
            <p className="text-xs text-text-dark font-body">Đổi phôi nấm mới nếu không phát sinh quả thể.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Headphones className="w-6 h-6 text-primary-neon flex-shrink-0" />
          <div>
            <h5 className="font-heading font-bold text-sm uppercase text-text-pure mb-1">Hỗ Trợ Kỹ Thuật 24/7</h5>
            <p className="text-xs text-text-dark font-body">Chuyên gia sinh học tư vấn trọn đời chu kỳ nuôi.</p>
          </div>
        </div>
      </Container>

      {/* FOOTER CORE LINKS */}
      <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
        
        {/* BRAND COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl uppercase tracking-wider text-text-pure">
              Cyber<span className="text-primary-neon neon-text-cyan">Mushroom</span>
            </span>
          </Link>
          <p className="text-sm text-text-dark max-w-sm font-body leading-relaxed">
            Nền tảng thương mại điện tử phân phối các dòng sản phẩm nấm hữu cơ cao cấp, ứng dụng công nghệ sinh học đột phá và ngôn ngữ thiết kế tương lai.
          </p>
          {/* Newsletter Subscribe Area */}
          <form onSubmit={handleSubscribe} className="relative max-w-sm mt-2">
            <input 
              type="email" 
              placeholder="Nhập mã định danh email..." 
              className="w-full px-4 py-3 bg-background-card/50 border border-white/10 text-sm font-mono text-text-pure placeholder:text-text-dark focus:border-primary-neon focus:outline-none transition-colors pr-12"
              required
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-primary-neon text-background-deep flex items-center justify-center hover:bg-primary-cyan transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* LINK COLUMNS */}
        {Object.values(FOOTER_LINKS).map((group) => (
          <div key={group.title} className="flex flex-col gap-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-primary-neon">
              {group.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {group.links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-text-dark hover:text-text-pure transition-colors font-body">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      {/* BOTTOM LEGAL & GATEWAY PARTNERS */}
      <Container className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-text-dark font-mono">
          &copy; {new Date().getFullYear()} CYBERMUSHROOM CORP. ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center gap-6 text-xs font-mono text-text-dark">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary-neon rounded-full" />
            Cổng VietQR Tự Động
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-secondary-purple rounded-full" />
            Bank Transfer
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-text-dark rounded-full" />
            COD Bảo Mật
          </div>
        </div>
      </Container>
    </footer>
  );
}