"use client";

import { Activity, AlertTriangle, ClipboardCheck } from "lucide-react";
import type { CheckoutSubmitStatusProps } from "./checkout.types";

export function CheckoutSubmitStatus({ isPending, serverError }: CheckoutSubmitStatusProps) {
  return (
    <section className="min-w-0 space-y-3" aria-label="Trạng thái tạo vận đơn">
      {serverError && (
        <div role="alert" aria-live="assertive" className="flex min-w-0 items-start gap-2 border border-red-500/20 bg-red-500/5 p-3 text-red-400">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words">{serverError}</span>
        </div>
      )}
      <button type="submit" disabled={isPending} aria-busy={isPending || undefined} className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 bg-primary-neon px-4 text-center font-heading text-xs font-black uppercase tracking-widest text-background-deep shadow-neon-cyan/10 hover:bg-primary-cyan focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-40">
        {isPending ? <><Activity aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" /><span className="break-words">Đang tạo đơn hàng...</span></> : <><ClipboardCheck aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="break-words">Đặt hàng và thanh toán</span></>}
      </button>
      <p className="text-center text-[9px] uppercase leading-relaxed text-text-dark">Thông tin đơn hàng sẽ được kiểm tra trước khi vận đơn được tạo.</p>
    </section>
  );
}
