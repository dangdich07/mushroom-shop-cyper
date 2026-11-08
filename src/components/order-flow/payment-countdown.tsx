import { AlertTriangle, Clock } from "lucide-react";

interface PaymentCountdownProps {
  formattedTime: string;
  expired: boolean;
  expiringSoon: boolean;
}

export function PaymentCountdown({ expired, expiringSoon, formattedTime }: PaymentCountdownProps) {
  return (
    <div role="timer" aria-live="polite" aria-label={expired ? "Mã thanh toán đã hết hạn" : `Thời gian thanh toán còn lại ${formattedTime}`} className={`flex w-full min-w-0 items-center justify-center gap-3 rounded-lg border px-4 py-3 ${expired || expiringSoon ? "border-red-500/40 bg-red-500/10 text-red-500" : "border-primary-cyan/25 bg-primary-cyan/5 text-primary-cyan"}`}>
      {expired ? <AlertTriangle aria-hidden="true" className="h-7 w-7 shrink-0" /> : <Clock aria-hidden="true" className="h-7 w-7 shrink-0" />}
      <div className="min-w-0">
        <span className="block text-xs font-medium">{expired ? "Đã hết thời hạn thanh toán" : expiringSoon ? "Sắp hết hạn thanh toán" : "Thời gian còn lại"}</span>
        <strong className="mt-1 block font-mono text-[32px] font-bold leading-none tabular-nums">{formattedTime}</strong>
      </div>
    </div>
  );
}
