"use client";

import { Activity, AlertTriangle, CheckCircle2, Percent, Tag, X } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { CartVoucherPanelProps } from "./cart.types";

export function CartVoucherPanel(props: CartVoucherPanelProps) {
  return (
    <section className="mt-3 flex min-w-0 flex-col gap-3 border-b border-primary-neon/12 pb-4" aria-labelledby="cart-voucher-title">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-control border border-primary-neon/25 bg-primary-neon/[0.06] text-primary-neon">
          <Tag aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h3 id="cart-voucher-title" className="font-heading text-sm font-bold text-text-pure">Mã ưu đãi</h3>
        </div>
      </div>

      <form onSubmit={props.onSubmit} className="min-w-0">
        <label className="sr-only" htmlFor="cart-voucher-code">Nhập mã voucher</label>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <div className="relative min-w-0 flex-1">
            <Percent aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-neon" />
            <input id="cart-voucher-code" type="text" value={props.voucherCode} onChange={(event) => props.onCodeChange(event.target.value)} placeholder="Nhập mã ưu đãi" disabled={props.isValidating} autoComplete="off" className="min-h-11 w-full min-w-0 rounded-control border border-white/10 bg-background-dark/70 py-2 pl-10 pr-3 font-mono text-[11px] font-bold uppercase text-text-pure outline-none transition-colors placeholder:font-body placeholder:font-normal placeholder:normal-case placeholder:text-text-dark/70 hover:border-primary-neon/30 focus-visible:bio-focus disabled:opacity-50" />
          </div>
          <button type="submit" disabled={props.isValidating || !props.voucherCode.trim()} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control border border-primary-neon/60 bg-primary-neon/[0.06] px-3.5 font-heading text-xs font-bold text-primary-neon transition-colors hover:bg-primary-neon hover:text-background-deep focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-40">
            {props.isValidating ? <><Activity aria-hidden="true" className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" /> Đang kiểm tra</> : "Áp dụng"}
          </button>
        </div>
      </form>

      {props.appliedVoucher && (
        <div className={`flex min-w-0 items-start justify-between gap-3 rounded-control border p-3 ${props.isAppliedVoucherEligible ? "border-status-success/25 bg-status-success/[0.07]" : "border-status-warning/25 bg-status-warning/[0.06]"}`} role="status">
          <div className="flex min-w-0 gap-3">
            <CheckCircle2 aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${props.isAppliedVoucherEligible ? "text-status-success" : "text-status-warning"}`} />
            <div className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.13em] text-text-dark">Voucher đang áp dụng</span>
              <strong className="mt-1 block break-all font-heading text-sm text-text-pure">{props.appliedVoucher.code}</strong>
              <p className="mt-1 break-words text-xs leading-5 text-text-muted">
                {props.appliedVoucher.discountType === "PERCENT" ? `Giảm ${props.appliedVoucher.discountValue}%` : `Giảm ${formatVND(props.appliedVoucher.discountValue)}`}
                {props.appliedVoucher.description ? ` · ${props.appliedVoucher.description}` : ""}
              </p>
              <p className="mt-1 font-mono text-[8px] leading-4 text-text-dark">Đơn tối thiểu {formatVND(props.appliedVoucher.minSubtotal)} · Hạn {props.appliedVoucher.expiryDate}</p>
            </div>
          </div>
          <button type="button" onClick={props.onRemoveVoucher} aria-label={`Gỡ mã ${props.appliedVoucher.code}`} title="Gỡ mã" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-text-dark transition-colors hover:bg-status-danger/10 hover:text-status-danger focus-visible:bio-focus">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}

      {props.appliedVoucherIneligibility && (
        <p role="status" className="flex items-start gap-2 rounded-control border border-status-warning/25 bg-status-warning/[0.06] p-3 text-xs leading-5 text-status-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{props.appliedVoucherIneligibility}</span>
        </p>
      )}
      {props.voucherError && (
        <p role="alert" className="flex items-start gap-2 rounded-control border border-status-danger/25 bg-status-danger/[0.06] p-3 text-xs leading-5 text-status-danger">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> <span className="break-words">{props.voucherError}</span>
        </p>
      )}
      {props.voucherSuccess && (
        <p role="status" className="flex items-start gap-2 rounded-control border border-status-success/25 bg-status-success/[0.06] p-3 text-xs leading-5 text-status-success">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> <span className="break-words">{props.voucherSuccess}</span>
        </p>
      )}
    </section>
  );
}
