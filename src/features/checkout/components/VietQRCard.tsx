"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldCheck, ReceiptText } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { PaymentCountdown } from "@/components/order-flow/payment-countdown";
import { PaymentQrPanel } from "@/components/order-flow/payment-qr-panel";
import { PaymentStatusPanel } from "@/components/order-flow/payment-status-panel";
import { supabase } from "@/lib/supabaseClient";

interface VietQRCardProps {
  orderId: string;
  grandTotal: number;
  qrUrl: string;
  referenceCode: string;
  expiresAt: string;
}

interface RealtimePaymentPayload {
  status: string;
  order_id: string;
}

type CopyField = "AMOUNT" | "REF";

export function VietQRCard({ orderId, grandTotal, qrUrl, referenceCode, expiresAt }: VietQRCardProps) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const timeoutHandledRef = useRef(false);
  const paidHandledRef = useRef(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const paymentChannel = supabase
      .channel(`realtime-payment:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updatedPayment = payload.new as RealtimePaymentPayload;
          if (updatedPayment && updatedPayment.status === "PAID" && !paidHandledRef.current) {
            paidHandledRef.current = true;
            router.push(`/checkout/success?orderId=${orderId}`);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentChannel);
    };
  }, [orderId, router]);

  useEffect(() => {
    const updateCountdown = () => {
      const nextTimeLeft = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(nextTimeLeft);
      if (nextTimeLeft === 0 && !timeoutHandledRef.current) {
        timeoutHandledRef.current = true;
        router.push("/cart?error=TIMEOUT");
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, router]);

  useEffect(() => () => {
    if (copyResetRef.current) clearTimeout(copyResetRef.current);
  }, []);

  const copyToClipboard = async (text: string, field: CopyField) => {
    if (copyResetRef.current) clearTimeout(copyResetRef.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("CLIPBOARD_UNAVAILABLE");
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setCopyMessage(field === "AMOUNT" ? "Đã sao chép số tiền thanh toán." : "Đã sao chép nội dung chuyển khoản.");
    } catch {
      setCopiedField(null);
      setCopyMessage("Không thể sao chép tự động. Vui lòng chọn và sao chép nội dung thủ công.");
    }
    copyResetRef.current = setTimeout(() => {
      setCopiedField(null);
      setCopyMessage(null);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const expired = timeLeft === 0;
  const expiringSoon = timeLeft > 0 && timeLeft < 60;

  return (
    <section className="vietqr-layout" aria-labelledby="vietqr-card-title">
      <style jsx global>{`
        .vietqr-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; font-size: 14px; }
        .vietqr-layout .vietqr-surface { min-width: 0; padding: 12px; border: 1px solid rgb(0 195 220 / .35); border-radius: 10px; background: var(--color-surface-glass); backdrop-filter: blur(16px); box-shadow: inset 0 1px 0 rgb(0 210 230 / .06), 0 12px 36px rgb(0 0 0 / .08); }
        .vietqr-layout .vietqr-title { font-size: 26px; line-height: 1.15; font-weight: 700; }
        .vietqr-layout .vietqr-panel { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
        .vietqr-layout .vietqr-panel dl { padding: 0; border: 0; background: transparent; }
        .vietqr-layout .vietqr-panel dl strong { font-size: 24px; }
        .vietqr-layout .vietqr-panel dl > div:last-child strong { font-size: 16px; line-height: 1.4; }
        .vietqr-layout .vietqr-panel dl > div { padding-bottom: 10px; gap: 4px; }
        .vietqr-layout .vietqr-panel dl > div + div { margin-top: 10px; }
        .vietqr-layout .vietqr-panel dt { font-size: 12px; }
        .vietqr-layout .vietqr-panel dd { flex-wrap: nowrap; gap: 8px; }
        .vietqr-layout .vietqr-panel dd strong { flex: 1; }
        .vietqr-layout .vietqr-panel dd button { min-height: 44px; padding: 0 10px; font-size: 11px; }
        .vietqr-layout .vietqr-panel > div { gap: 8px; }
        .vietqr-layout .vietqr-panel [role=timer] { padding: 8px 10px; }
        .vietqr-layout .vietqr-panel [role=timer] strong { font-size: 26px; }
        .vietqr-layout .vietqr-panel > div > p { padding: 8px; font-size: 11px; line-height: 16px; }
        .vietqr-layout .vietqr-panel [role=status]:empty { min-height: 0; }
        .vietqr-layout header { margin-bottom: 12px; }
        .vietqr-layout header p { margin-top: 4px; font-size: 12px; line-height: 18px; }
        .vietqr-layout > div { gap: 10px; }
        .vietqr-layout .vietqr-extras { gap: 10px; }
        .vietqr-layout .vietqr-extras h2 { margin-bottom: 6px; font-size: 13px; line-height: 18px; }
        .vietqr-layout .vietqr-extras p { font-size: 11px; line-height: 16px; }
        .vietqr-layout .vietqr-extras .border-t { margin-top: 8px; padding-top: 6px; }
        .vietqr-layout aside { gap: 14px; }
        .vietqr-layout aside > [role=status] { padding: 10px; gap: 10px; }
        .vietqr-layout aside > [role=status] > span:first-child { width: 42px; height: 42px; }
        .vietqr-layout aside > [role=status] > span:last-child { font-size: 15px; }
        .vietqr-layout aside ol { padding-left: 14px; font-size: 13px; }
        .vietqr-layout aside ol li + li { margin-top: 14px; }
        .vietqr-layout aside ol p + p { font-size: 11px; line-height: 17px; }
        @media (min-width: 640px) { .vietqr-layout .vietqr-panel { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
        @media (min-width: 1000px) { .vietqr-layout { grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); align-items: stretch; } }
        @media (max-width: 639px) { .vietqr-layout .vietqr-surface { padding: 14px; } }
      `}</style>
      <div className="flex min-w-0 flex-col gap-4">
      <div className="vietqr-surface">
      <header className="mb-5 min-w-0">
        <h1 id="vietqr-card-title" className="vietqr-title font-heading text-text-pure">Thanh toán <span className="text-primary-cyan">VietQR</span></h1>
        <p className="mt-2 text-[13px] leading-5 text-text-muted">Quét mã QR bằng ứng dụng ngân hàng để thanh toán đơn hàng của bạn.</p>
      </header>

      <PaymentQrPanel
        amount={grandTotal}
        copiedField={copiedField}
        copyMessage={copyMessage}
        onCopy={copyToClipboard}
        qrUrl={qrUrl}
        referenceCode={referenceCode}
        countdown={<PaymentCountdown formattedTime={formatTime(timeLeft)} expired={expired} expiringSoon={expiringSoon} />}
        warningOverlay={expiringSoon ? <div role="alert" className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300"><AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0" /><span className="text-sm font-semibold">Mã thanh toán sắp hết hạn. Vui lòng kiểm tra thời gian còn lại trước khi chuyển khoản.</span></div> : undefined}
      />
      </div>
      <div className="vietqr-extras grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="vietqr-surface">
          <h2 className="mb-3 flex items-center gap-2 font-heading text-base font-semibold text-text-pure"><ReceiptText aria-hidden="true" className="h-5 w-5 text-primary-cyan" /> Thông tin đơn hàng</h2>
          <p className="text-xs text-text-dark">Mã đơn hàng</p>
          <p className="mt-1 break-all font-mono text-xs text-text-muted">{orderId}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-primary-cyan/20 pt-3"><span className="text-xs text-text-muted">Tổng thanh toán</span><strong className="text-lg text-primary-cyan">{formatVND(grandTotal)}</strong></div>
        </div>
        <div className="vietqr-surface">
          <h2 className="mb-3 flex items-center gap-2 font-heading text-base font-semibold text-primary-cyan"><ShieldCheck aria-hidden="true" className="h-5 w-5" /> Thanh toán tại CyberMushroom</h2>
          <p className="text-xs leading-6 text-text-muted">Kiểm tra số tiền và nội dung chuyển khoản trên ứng dụng ngân hàng trước khi xác nhận.</p>
          <p className="mt-2 text-xs leading-6 text-text-dark">Trang tự chuyển sang xác nhận đơn hàng khi thanh toán được ghi nhận.</p>
        </div>
      </div>
      </div>
      <aside className="vietqr-surface flex min-w-0 flex-col gap-5" aria-label="Theo dõi thanh toán">
        <PaymentStatusPanel message={expired ? "Thời hạn thanh toán đã kết thúc" : "Đang chờ thanh toán"} />
        <p className="break-all text-xs text-text-dark">Đơn hàng <span className="font-mono text-primary-cyan">{orderId}</span></p>
        <ol className="space-y-5 border-l border-primary-cyan/25 pl-5 text-sm">
          <li><p className="font-semibold text-text-pure">1. Đã tạo đơn hàng</p><p className="mt-1 text-xs leading-5 text-text-dark">Thông tin đơn hàng đã được ghi nhận.</p></li>
          <li aria-current="step"><p className="font-semibold text-primary-cyan">2. {expired ? "Hết hạn thanh toán" : "Đang chờ thanh toán"}</p><p className="mt-1 text-xs leading-5 text-text-dark">Vui lòng chuyển khoản theo mã QR và thông tin của đơn hàng.</p></li>
          <li><p className="text-text-muted">3. Xác nhận thanh toán</p><p className="mt-1 text-xs leading-5 text-text-dark">Hệ thống tự động cập nhật sau khi ghi nhận thanh toán.</p></li>
          <li><p className="text-text-muted">4. Hoàn tất</p><p className="mt-1 text-xs leading-5 text-text-dark">Bạn sẽ được chuyển sang trang xác nhận đơn hàng.</p></li>
        </ol>
        <div className="mt-auto flex items-start gap-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-4">
          <AlertTriangle aria-hidden="true" className="h-6 w-6 shrink-0 text-amber-500" />
          <div><p className="text-sm font-semibold text-text-pure">Giữ trang này mở</p><p className="mt-1 text-xs leading-5 text-text-muted">Vui lòng chờ hệ thống xác nhận và tự chuyển trang sau khi thanh toán.</p></div>
        </div>
      </aside>
    </section>
  );
}
