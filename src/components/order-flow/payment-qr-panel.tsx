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
}

export function PaymentQrPanel({ amount, copiedField, copyMessage, onCopy, qrUrl, referenceCode, warningOverlay }: PaymentQrPanelProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showQr = Boolean(qrUrl) && !imageFailed;

  return (
    <div className="flex min-w-0 flex-col items-center gap-5">
      <div className="relative aspect-square w-full max-w-72 overflow-hidden border-2 border-primary-cyan/30 bg-white p-3 shadow-[0_0_20px_rgba(0,245,255,0.05)] sm:max-w-80">
        {showQr ? (
          <img src={qrUrl} alt="Mã VietQR của đơn hàng" onError={() => setImageFailed(true)} className="h-full w-full object-contain" />
        ) : (
          <div role="status" className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-background-deep">
            <ImageOff aria-hidden="true" className="h-8 w-8" />
            <strong className="text-[10px] uppercase">Không thể hiển thị mã QR</strong>
            <span className="text-[9px] leading-relaxed">Bạn vẫn có thể sử dụng số tiền và nội dung chuyển khoản bên dưới.</span>
          </div>
        )}
        {warningOverlay}
      </div>

      <p className="max-w-sm break-words text-center text-[10px] uppercase leading-relaxed text-text-dark">Sử dụng ứng dụng Ngân hàng (Mobile Banking) quét mã QR động để tự động điền thông số tài chính chính xác.</p>

      <dl className="w-full min-w-0 space-y-4 border border-white/5 bg-transparent p-4">
        <CopyRow label="Số tiền cần thanh toán" value={formatVND(amount)} buttonLabel="Sao chép số tiền thanh toán" copied={copiedField === "AMOUNT"} onCopy={() => onCopy(amount.toString(), "AMOUNT")} />
        <CopyRow label="Nội dung bắt buộc ghi" value={referenceCode} buttonLabel="Sao chép nội dung chuyển khoản" copied={copiedField === "REF"} onCopy={() => onCopy(referenceCode, "REF")} />
      </dl>
      <div aria-live="polite" role="status" className="min-h-5 break-words text-center text-[10px] text-text-dark">{copyMessage}</div>
    </div>
  );
}

function CopyRow({ buttonLabel, copied, label, onCopy, value }: { buttonLabel: string; copied: boolean; label: string; onCopy: () => void; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 border-b border-white/5 pb-4 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:items-center">
      <dt className="break-words text-[9px] uppercase text-text-dark">{label}:</dt>
      <dd className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
        <strong className="min-w-0 break-all text-left text-xs font-black text-primary-cyan sm:text-right sm:text-sm">{value}</strong>
        <button type="button" onClick={onCopy} aria-label={buttonLabel} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center border border-white/10 text-text-dark hover:border-primary-cyan hover:text-text-pure focus-visible:bio-focus">
          {copied ? <Check aria-hidden="true" className="h-4 w-4 text-primary-neon" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
        </button>
      </dd>
    </div>
  );
}
