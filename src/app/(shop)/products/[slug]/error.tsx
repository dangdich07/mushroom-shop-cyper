"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Container } from "@/components/layout/container";

export default function ProductDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Product detail render failed", error);
  }, [error]);

  return (
    <div className="home-bio-shell min-h-[70vh] py-10 sm:py-16">
      <Container wide>
        <div className="mx-auto flex min-h-[28rem] max-w-2xl flex-col items-center justify-center rounded-[14px] border border-status-danger/25 bg-surface-glass px-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-status-danger/30 bg-status-danger/10 text-status-danger">
            <AlertTriangle aria-hidden="true" className="h-7 w-7" />
          </span>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-status-danger">Không thể tải dữ liệu</p>
          <h1 className="mt-3 font-heading text-2xl font-bold text-text-pure sm:text-3xl">Chi tiết sản phẩm đang gián đoạn</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-text-dark">Vui lòng thử tải lại. Giỏ hàng và dữ liệu tài khoản của bạn không bị thay đổi.</p>
          <button type="button" onClick={reset} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-primary-neon px-6 font-heading text-sm font-bold text-background-deep transition-colors hover:bg-primary-cyan focus-visible:bio-focus">
            <RefreshCw aria-hidden="true" className="h-4 w-4" /> Thử lại
          </button>
        </div>
      </Container>
    </div>
  );
}
