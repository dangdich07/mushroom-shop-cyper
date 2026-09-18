"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";
import { subscribeNewsletter } from "@/features/newsletter/actions";

const INITIAL_NEWSLETTER_STATE = { message: "", status: "IDLE" as const };

interface FooterItem {
  available: boolean;
  href?: string;
  label: string;
}

interface FooterGroup {
  links: FooterItem[];
  title: string;
}

const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Nấm dược liệu", href: "/products?category=MEDICINAL", available: true },
      { label: "Nấm thực phẩm", href: "/products?category=FOOD", available: true },
      { label: "Thiết bị và phôi nấm", href: "/products?category=EQUIPMENT", available: true },
      { label: "Toàn bộ danh mục", href: "/products", available: true },
    ],
  },
  {
    title: "Chính sách",
    links: [
      { label: "Vận chuyển kiểm soát nhiệt", available: false },
      { label: "Bảo hành phôi nấm", available: false },
      { label: "Đổi trả sản phẩm", available: false },
      { label: "Bảo mật khách hàng", available: false },
    ],
  },
  {
    title: "Doanh nghiệp",
    links: [
      { label: "Câu chuyện CyberMushroom", available: false },
      { label: "Chứng nhận hoạt chất", available: false },
      { label: "Hệ thống phòng thí nghiệm", available: false },
      { label: "Liên hệ doanh nghiệp", available: false },
    ],
  },
];

const PAYMENT_SIGNALS = [
  { label: "VietQR tự động", color: "bg-primary-neon" },
  { label: "Chuyển khoản", color: "bg-secondary-purple" },
  { label: "COD bảo mật", color: "bg-text-dark" },
] as const;

export function Footer() {
  const [newsletterState, newsletterAction, newsletterPending] = useActionState(
    subscribeNewsletter,
    INITIAL_NEWSLETTER_STATE,
  );

  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-white/[0.07] bg-background-dark pb-8 pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-secondary-purple/[0.05] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-0 h-32 w-80 bg-primary-neon/[0.025] blur-[90px]"
      />

      <Container className="grid grid-cols-1 gap-10 border-b border-white/[0.07] py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col items-start gap-4 lg:col-span-2">
          <BrandMark />
          <p className="max-w-sm text-sm leading-relaxed text-text-dark">
            Nền tảng thương mại điện tử dành cho nấm hữu cơ, nấm dược liệu và
            hệ sinh thái nuôi trồng ứng dụng công nghệ sinh học.
          </p>

          <div className="mt-1 w-full max-w-sm">
            <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-dark">
              Bản tin nghiên cứu và ưu đãi
            </p>
            <form action={newsletterAction} className="relative">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email nhận bản tin
              </label>
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email của bạn"
                className="min-h-12 w-full border border-white/10 bg-background-card/50 px-4 pr-14 font-mono text-xs text-text-pure outline-none transition-colors placeholder:text-text-dark focus:border-primary-neon focus-visible:bio-focus"
                required
                disabled={newsletterPending}
              />
              <button
                type="submit"
                disabled={newsletterPending}
                aria-label="Đăng ký nhận bản tin"
                className="absolute bottom-1 right-1 top-1 flex min-w-11 items-center justify-center bg-primary-neon text-background-deep transition-colors hover:bg-primary-cyan focus-visible:bio-focus disabled:cursor-wait disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
            <p
              className={`mt-2 text-[11px] leading-relaxed ${newsletterState.status === "ERROR" ? "text-status-danger" : newsletterState.status === "SUCCESS" ? "text-primary-neon" : "text-text-dark"}`}
              role={newsletterState.status === "ERROR" ? "alert" : "status"}
              aria-live="polite"
            >
              {newsletterPending
                ? "Đang đăng ký bản tin..."
                : newsletterState.message || "Nhận thông tin nghiên cứu và ưu đãi mới."}
            </p>
          </div>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`footer-${group.title}`}>
            <h2
              id={`footer-${group.title}`}
              className="font-heading text-xs font-black uppercase tracking-widest text-primary-neon"
            >
              {group.title}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {group.links.map((item) => (
                <li key={item.label}>
                  {item.available && item.href ? (
                    <Link
                      href={item.href}
                      className="inline-flex min-h-8 items-center text-sm text-text-dark transition-colors hover:text-text-pure focus-visible:bio-focus"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div className="flex min-h-8 flex-wrap items-center gap-2 text-sm text-text-dark/80">
                      <span>{item.label}</span>
                      <span className="border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-text-dark">
                        Đang cập nhật
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>

      <Container className="flex flex-col items-start justify-between gap-5 pt-8 md:flex-row md:items-center">
        <p className="font-mono text-[10px] uppercase tracking-wider text-text-dark">
          &copy; {new Date().getFullYear()} CyberMushroom. All rights reserved.
        </p>
        <div
          aria-label="Phương thức thanh toán hỗ trợ"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-wider text-text-dark"
        >
          {PAYMENT_SIGNALS.map((signal) => (
            <span key={signal.label} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${signal.color}`}
              />
              {signal.label}
            </span>
          ))}
        </div>
      </Container>
    </footer>
  );
}
