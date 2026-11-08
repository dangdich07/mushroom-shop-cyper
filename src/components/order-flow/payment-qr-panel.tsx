"use client";

import { useState } from "react";
import { Check, Copy, ImageOff } from "lucide-react";
import { formatVND } from "@/lib/utils";

type CopyField = "AMOUNT" | "REF";

interface PaymentQrPanelProps {
  amount: number;
  copiedField: CopyField | null;
  copyMessage: string | null;
  onCopy: (text: string, field: CopyField) => void;
  qrUrl: string;
  referenceCode: string;
  warningOverlay?: React.ReactNode;
  countdown?: React.ReactNode;
  status?: React.ReactNode;
}

export function PaymentQrPanel({ amount, copiedField, copyMessage, onCopy, qrUrl, referenceCode, warningOverlay, countdown, status }: PaymentQrPanelProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showQr = Boolean(qrUrl) && !imageFailed;

  return (
    <div className="vietqr-panel min-w-0 items-start">
      <div className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-primary-cyan/25 bg-primary-cyan/[0.03] p-[10px]">
      <div className="relative aspect-square w-full max-w-[248px] overflow-hidden rounded-lg border-2 border-primary-cyan/40 bg-white p-[6px] shadow-[0_0_26px_rgba(0,210,230,0.12)]">
        {showQr ? (
          <img src={qrUrl} alt="Mã VietQR của đơn hàng" onError={() => setImageFailed(true)} className="h-full w-full object-contain" />
        ) : (
          <div role="status" className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-slate-800">
            <ImageOff aria-hidden="true" className="h-8 w-8" />
            <strong className="text-sm">Không thể hiển thị mã QR</strong>
            <span className="text-xs leading-relaxed">Vui lòng kiểm tra kết nối và tải lại trang để xem mã thanh toán.</span>
          </div>
        )}
      </div>

      <p className="max-w-sm text-center text-xs leading-5 text-text-dark">Mở ứng dụng ngân hàng và quét mã VietQR. Kiểm tra thông tin trước khi xác nhận chuyển khoản.</p>
      </div>
      <div className="flex min-w-0 flex-col gap-4">

      <dl className="w-full min-w-0 space-y-5 rounded-xl border border-primary-cyan/20 bg-background-card/60 p-4 sm:p-5">
        <CopyRow label="Số tiền cần thanh toán" value={formatVND(amount)} buttonLabel="Sao chép số tiền thanh toán" copied={copiedField === "AMOUNT"} onCopy={() => onCopy(amount.toString(), "AMOUNT")} />
        <CopyRow label="Nội dung chuyển khoản" value={referenceCode} buttonLabel="Sao chép nội dung chuyển khoản" copied={copiedField === "REF"} onCopy={() => onCopy(referenceCode, "REF")} />
      </dl>
      {countdown}
      <div aria-live="polite" role="status" className="min-h-5 break-words text-xs text-text-muted">{copyMessage}</div>
      {status}
      {warningOverlay}
      <p className="rounded-lg border border-primary-cyan/15 bg-primary-cyan/5 p-4 text-xs leading-5 text-text-muted">Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để đơn hàng được đối soát chính xác.</p>
      </div>
    </div>
  );
}

function CopyRow({ buttonLabel, copied, label, onCopy, value }: { buttonLabel: string; copied: boolean; label: string; onCopy: () => void; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 border-b border-primary-cyan/15 pb-5 last:border-0 last:pb-0">
      <dt className="break-words text-sm text-text-dark">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <strong className="min-w-0 break-all font-heading text-[clamp(20px,2.3vw,30px)] font-bold leading-tight text-primary-cyan">{value}</strong>
        <button type="button" onClick={onCopy} aria-label={copied ? "Đã sao chép" : buttonLabel} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary-cyan/35 px-3 text-xs text-text-muted transition-colors hover:bg-primary-cyan/10 hover:text-primary-cyan focus-visible:bio-focus motion-reduce:transition-none">
          {copied ? <Check aria-hidden="true" className="h-4 w-4 text-primary-neon" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
          <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
        </button>
      </dd>
    </div>
  );
}
