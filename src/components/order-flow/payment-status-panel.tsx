import { Activity } from "lucide-react";

interface PaymentStatusPanelProps {
  message: string;
}

export function PaymentStatusPanel({ message }: PaymentStatusPanelProps) {
  return (
    <div role="status" aria-live="polite" className="flex min-w-0 items-center justify-center gap-2 border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-center">
      <Activity aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin text-primary-cyan motion-reduce:animate-none" />
      <span className="break-words text-[10px] uppercase tracking-wider text-text-dark">{message}</span>
    </div>
  );
}
