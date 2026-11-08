"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { Home, ChevronRight, Activity } from "lucide-react";

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <style jsx global>{`
        .checkout-bio {
          background: radial-gradient(ellipse at 15% 0%, rgb(0 210 230 / .09), transparent 48%), radial-gradient(ellipse at 95% 20%, rgb(70 130 220 / .07), transparent 40%), var(--color-background-deep);
        }
        .checkout-bio form { font-family: inherit; font-size: 14px; line-height: 1.5; }
        .checkout-bio form .glass-premium {
          border: 1px solid rgb(0 195 220 / .25); border-radius: 12px;
          background: var(--color-surface-glass); backdrop-filter: blur(16px);
          box-shadow: 0 12px 36px rgb(0 0 0 / .07); padding: 14px;
        }
        .checkout-bio form h2:not(.sr-only) {
          font-family: var(--font-heading), sans-serif; font-size: 16px;
          line-height: 1.4; text-transform: none; letter-spacing: normal;
          color: var(--color-text-pure); gap: 8px; padding-bottom: 8px;
          border-color: rgb(0 195 220 / .16);
        }
        .checkout-bio form h2 svg { width: 21px; height: 21px; color: var(--color-primary-cyan); }
        .checkout-bio form label { text-transform: none; font-size: 13px; }
        .checkout-bio form input:not([type=radio]), .checkout-bio form select {
          min-height: 44px; border-radius: 7px; border-color: rgb(90 155 185 / .35);
          font-family: inherit; font-size: 14px; font-weight: 400; text-transform: none;
          padding: 8px 10px; color: var(--color-text-pure); height: 44px;
        }
        .checkout-bio form input:focus, .checkout-bio form select:focus {
          border-color: var(--color-primary-cyan); box-shadow: 0 0 0 3px rgb(0 210 230 / .1);
        }
        .checkout-bio fieldset label { border-radius: 9px; min-height: 98px; padding: 12px; gap: 8px; }
        .checkout-bio fieldset label:has(input:checked) { box-shadow: inset 0 0 24px rgb(0 210 230 / .05), 0 0 14px rgb(0 210 230 / .09); }
        .checkout-bio fieldset strong { text-transform: none; letter-spacing: normal; font-size: 14px; }
        .checkout-bio fieldset label span span { font-size: 12px; line-height: 1.6; }
        .checkout-bio #saved-addresses-title { font-size: 12px; text-transform: none; }
        .checkout-bio section[aria-labelledby=saved-addresses-title] { border-radius: 8px; padding: 10px; }
        .checkout-bio section[aria-labelledby=saved-addresses-title] button { border-radius: 7px; padding: 8px 10px; font-size: 12px; }
        .checkout-bio section[aria-labelledby=saved-addresses-title] button span { font-size: 12px; text-transform: none; }
        .checkout-bio .checkout-summary .glass-premium { border: 0; box-shadow: none; background: transparent; padding: 0; backdrop-filter: none; }
        .checkout-bio .checkout-summary dl { font-size: 14px; border-color: rgb(0 195 220 / .18); }
        .checkout-bio .checkout-summary dl + div { border-radius: 8px; }
        .checkout-bio .checkout-summary section > .grid > div { border-radius: 7px; padding: 8px 12px; border-color: rgb(0 195 220 / .12); }
        .checkout-bio .checkout-summary span, .checkout-bio .checkout-summary p { text-transform: none; letter-spacing: normal; }
        .checkout-bio .checkout-summary .text-\\[9px\\], .checkout-bio .checkout-summary .text-\\[8px\\] { font-size: 12px; }
        .checkout-bio .checkout-summary button[type=submit] {
          min-height: 44px; border-radius: 8px; font-family: inherit; font-size: 14px;
          text-transform: none; letter-spacing: normal; background: linear-gradient(105deg, #00d9e9, #50c9f0 60%, #9c55f5);
          color: #031521; box-shadow: 0 6px 24px rgb(0 210 230 / .15);
        }
        .checkout-bio .checkout-summary [role=alert] { border-radius: 8px; font-size: 13px; }
        .checkout-bio .checkout-form { gap: 16px; }
        .checkout-bio .checkout-form > div { gap: 12px; }
        .checkout-bio section[aria-labelledby=shipping-section-title] { gap: 12px; }
        .checkout-bio section[aria-labelledby=shipping-section-title] > .grid { gap: 12px; }
        .checkout-bio .checkout-summary { gap: 12px; padding: 14px; }
        .checkout-bio .checkout-items {
          max-height: 325px;
          overflow-y: auto;
          overscroll-behavior-y: contain;
          scrollbar-width: thin;
          scrollbar-color: rgb(0 195 220 / .45) transparent;
          scrollbar-gutter: stable;
          padding-right: 6px;
        }
        .checkout-bio .checkout-items li { min-height: 65px; gap: 10px; padding: 8px 0; }
        .checkout-bio .checkout-items li > div > p:first-child { font-size: 13px; line-height: 1.4; }
        .checkout-bio .checkout-items li > span { font-size: 13px; line-height: 1.4; }
        .checkout-bio .checkout-items li > div > p + p { margin-top: 3px; font-size: 11px; line-height: 1.4; }
        .checkout-bio .checkout-summary > section { gap: 10px; }
        .checkout-bio .checkout-summary dl { font-size: 13px; }
        .checkout-bio .checkout-banner {
          position: relative;
          min-height: 160px;
          margin-bottom: 16px;
          padding: 8px 20px 16px;
          overflow: hidden;
          border: 1px solid rgb(0 195 220 / .25);
          border-radius: 10px;
          background-color: #031521;
          background-image: linear-gradient(90deg, rgb(3 15 25 / .94), rgb(3 15 25 / .7) 52%, rgb(3 15 25 / .35)), url('/images/catalog-lingzhi-lab.webp');
          background-size: cover;
          background-position: center, center 46%;
        }
        .checkout-bio .checkout-banner::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgb(70 210 235 / .045) 1px, transparent 1px), linear-gradient(90deg, rgb(70 210 235 / .045) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .checkout-bio .checkout-banner nav { position: relative; margin-bottom: 4px; }
        .checkout-bio .checkout-banner header { margin: 0; padding: 0; border: 0; gap: 14px; }
        .checkout-bio .checkout-banner h1 { font-size: clamp(28px, 2.5vw, 36px); color: #f0faff; }
        .checkout-bio .checkout-banner header p { margin-top: 6px; font-size: 13px; line-height: 1.5; color: #b8d0df; }
        .checkout-bio .checkout-banner nav, .checkout-bio .checkout-banner nav a { color: #b8d0df; }
        .checkout-bio .checkout-banner nav [aria-current=page] { color: #f0faff; }
        .checkout-bio .checkout-banner nav a:hover { color: #37e8f4; }
        .checkout-bio .checkout-banner header > ol { padding: 10px 8px; border-radius: 8px; background: rgb(3 15 25 / .65); color: #b8d0df; backdrop-filter: blur(6px); }
        .checkout-bio .checkout-banner [aria-current=step] { color: #37e8f4; }
        @media (max-width: 639px) {
          .checkout-bio .checkout-banner { padding: 6px 12px 12px; background-position: center, 65% center; }
          .checkout-bio form .glass-premium { padding: 16px; }
          .checkout-bio .checkout-summary .glass-premium { padding: 0; }
          .checkout-bio form h2 { font-size: 16px; }
          .checkout-bio fieldset label { min-height: 104px; }
        }
        @media (prefers-reduced-motion: reduce) { .checkout-bio *, .checkout-bio *::before { animation: none !important; transition: none !important; } }
      `}</style>
      <div className="checkout-bio relative min-h-screen min-w-0 overflow-x-clip border-b border-primary-cyan/10 py-2 text-sm sm:py-3">
        <Container wide>
          <section className="checkout-banner" aria-label="Thanh toán đơn hàng">
          <nav aria-label="Điều hướng phân cấp" className="mb-2 text-[12px] text-text-dark">
            <ol className="flex min-h-11 flex-wrap items-center gap-2">
              <li>
                <Link href="/" aria-label="Trang chủ" className="inline-flex min-h-11 items-center text-text-muted hover:text-primary-cyan focus-visible:bio-focus">
                  <Home aria-hidden="true" className="h-[13px] w-[13px]" />
                </Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3 text-primary-cyan/60" /></li>
              <li><Link href="/" className="inline-flex min-h-11 items-center hover:text-primary-cyan focus-visible:bio-focus">Trang chủ</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3 text-primary-cyan/60" /></li>
              <li aria-current="page" className="text-text-pure">Thanh toán</li>
            </ol>
          </nav>

          {/* TIÊU ĐỀ PHÂN KHU */}
          <header className="relative mb-6 grid min-w-0 items-center gap-5 overflow-hidden border-b border-primary-cyan/15 pb-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.65fr)]">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-32 w-72 bg-primary-neon/[0.04] blur-3xl" />
            <div className="relative min-w-0">
              <h1 className="break-words font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-bold leading-tight tracking-tight text-text-pure">Thanh toán</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-dark">Xác nhận thông tin giao nhận và phương thức thanh toán trước khi tạo đơn hàng.</p>
            </div>
            <ol aria-label="Tiến trình thanh toán" className="relative grid grid-cols-3 text-center text-xs text-text-dark">
              <li aria-current="step" className="relative flex flex-col items-center gap-2 text-primary-cyan"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-cyan bg-primary-cyan/10 text-sm font-bold shadow-[0_0_16px_rgba(0,210,230,0.2)]">1</span>Thông tin</li>
              <li className="relative flex flex-col items-center gap-2 before:absolute before:right-[calc(50%+18px)] before:top-[18px] before:h-px before:w-[calc(100%-36px)] before:bg-primary-cyan/25"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-cyan/25 text-sm">2</span>Thanh toán</li>
              <li className="relative flex flex-col items-center gap-2 before:absolute before:right-[calc(50%+18px)] before:top-[18px] before:h-px before:w-[calc(100%-36px)] before:bg-primary-cyan/25"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-cyan/25 text-sm">3</span>Hoàn tất</li>
            </ol>
          </header>
          </section>

          {/* KÍCH HOẠT THÀNH PHẦN HOÀN CHỈNH MỚI 
            Bọc trong Suspense để xử lý màng bọc useSearchParams() của Next.js 15 không bị lỗi Prerender Static Error
          */}
          <Suspense fallback={
            <div className="flex min-h-[45vh] items-center justify-center px-4 py-20 text-center text-primary-neon" role="status">
              <Activity aria-hidden="true" className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Đang tải thông tin thanh toán...
            </div>
          }>
            <CheckoutForm />
          </Suspense>

        </Container>
      </div>
    </PageWrapper>
  );
}
