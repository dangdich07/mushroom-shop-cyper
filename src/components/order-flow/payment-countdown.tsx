import { AlertTriangle, Clock } from "lucide-react";

interface PaymentCountdownProps {
  formattedTime: string;
  expired: boolean;
  expiringSoon: boolean;
}

export function PaymentCountdown({ expired, expiringSoon, formattedTime }: PaymentCountdownProps) {
  return (
    <div role="timer" aria-live="polite" aria-label={expired ? "Mã thanh toán đã hết hạn" : `Thời gian thanh toán còn lại ${formattedTime}`} className={`flex min-h-9 items-center gap-2 border px-3 py-1.5 font-bold ${expired || expiringSoon ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-white/10 bg-white/[0.03] text-text-pure"}`}>
      {expired ? <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0" /> : <Clock aria-hidden="true" className="h-4 w-4 shrink-0" />}
      <span className="break-words text-[10px] uppercase">{expired ? "Đã hết thời hạn thanh toán" : `Còn lại: ${formattedTime}`}</span>
    </div>
  );
}
