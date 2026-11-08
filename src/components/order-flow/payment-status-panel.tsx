import { Activity } from "lucide-react";

interface PaymentStatusPanelProps {
  message: string;
}

export function PaymentStatusPanel({ message }: PaymentStatusPanelProps) {
  return (
    <div role="status" aria-live="polite" className="flex min-w-0 items-center gap-4 rounded-xl border border-primary-cyan/25 bg-primary-cyan/[0.04] p-4 sm:p-5">
      <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary-cyan/40 bg-primary-cyan/10 shadow-[0_0_22px_rgba(0,210,230,0.1)]">
        <Activity className="h-6 w-6 animate-pulse text-primary-cyan motion-reduce:animate-none" />
      </span>
      <span className="min-w-0 break-words font-heading text-base font-semibold leading-relaxed text-text-pure">{message}</span>
    </div>
  );
}
