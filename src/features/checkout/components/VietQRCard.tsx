"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, QrCode } from "lucide-react";
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
    <section className="relative flex w-full min-w-0 flex-col gap-5 overflow-hidden border border-white/10 bg-background-card p-4 font-mono text-xs sm:p-6" aria-labelledby="vietqr-card-title">
      <div className="flex min-w-0 flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="vietqr-card-title" className="flex min-w-0 items-center gap-2 break-words text-[10px] font-bold uppercase tracking-widest text-primary-cyan"><QrCode aria-hidden="true" className="h-4 w-4 shrink-0" /> Cổng quyết toán lượng tử VietQR</h2>
        <PaymentCountdown formattedTime={formatTime(timeLeft)} expired={expired} expiringSoon={expiringSoon} />
      </div>

      <PaymentQrPanel
        amount={grandTotal}
        copiedField={copiedField}
        copyMessage={copyMessage}
        onCopy={copyToClipboard}
        qrUrl={qrUrl}
        referenceCode={referenceCode}
        warningOverlay={expiringSoon ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center backdrop-blur-sm"><AlertTriangle aria-hidden="true" className="h-8 w-8 text-red-500" /><span className="mt-2 text-[10px] font-bold uppercase text-text-pure">Mã vận đơn sắp hết thời hạn an toàn</span></div> : undefined}
      />

      <PaymentStatusPanel message={expired ? "Thời hạn thanh toán đã kết thúc." : "Hệ thống đang quét tín hiệu ngân hàng real-time..."} />
    </section>
  );
}
