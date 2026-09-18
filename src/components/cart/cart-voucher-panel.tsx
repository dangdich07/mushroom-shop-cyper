"use client";

import { Activity, AlertTriangle, CheckCircle, Tag } from "lucide-react";
import type { CartVoucherPanelProps } from "./cart.types";

export function CartVoucherPanel(props: CartVoucherPanelProps) {
  return (
    <section className="glass-premium flex min-w-0 flex-col gap-3 p-4" aria-labelledby="cart-voucher-title">
      <h2 id="cart-voucher-title" className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-[10px] font-bold uppercase text-text-pure">
        <Tag aria-hidden="true" className="h-3.5 w-3.5 text-primary-cyan" /> Giải mã xung mã ưu đãi
      </h2>
      <form onSubmit={props.onSubmit} className="flex min-w-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
        <label className="sr-only" htmlFor="cart-voucher-code">Mã ưu đãi</label>
        <input id="cart-voucher-code" type="text" value={props.voucherCode} onChange={(event) => props.onCodeChange(event.target.value)} placeholder="CYBERMUSH10" disabled={props.isValidating} autoComplete="off" className="min-h-11 min-w-0 flex-1 border border-white/10 bg-background-dark p-2 text-xs font-bold uppercase text-text-pure outline-none focus-visible:bio-focus disabled:opacity-50" />
        <button type="submit" disabled={props.isValidating || !props.voucherCode.trim()} className="inline-flex min-h-11 shrink-0 items-center justify-center border border-white/10 bg-white/5 px-4 font-bold uppercase tracking-wider text-text-pure hover:border-primary-cyan hover:bg-primary-cyan hover:text-background-deep focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-40">
          {props.isValidating ? <><Activity aria-hidden="true" className="mr-2 h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> Đang kiểm tra</> : "ÁP DỤNG"}
        </button>
      </form>

      {props.appliedVoucher && (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border border-primary-neon/20 bg-primary-neon/5 p-2.5" role="status">
          <div className="min-w-0">
            <span className="block text-[9px] uppercase text-text-dark">Mã đang chọn</span>
            <span className="block break-all font-bold text-primary-neon">{props.appliedVoucher.code}</span>
          </div>
          <button type="button" onClick={props.onRemoveVoucher} className="min-h-10 shrink-0 border border-white/10 px-3 text-[9px] font-bold uppercase text-text-muted hover:border-red-400/40 hover:text-red-300 focus-visible:bio-focus">Gỡ mã</button>
        </div>
      )}

      {props.appliedVoucher && !props.isAppliedVoucherEligible && (
        <p role="status" className="flex items-start gap-2 border border-amber-400/15 bg-amber-400/5 p-2 text-[10px] text-amber-300">
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span>Giỏ hàng chưa đạt điều kiện hoặc voucher đã hết hạn.</span>
        </p>
      )}
      {props.voucherError && (
        <p role="alert" className="flex items-start gap-2 border border-red-500/10 bg-red-500/5 p-2 text-[10px] text-red-400">
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> <span className="break-words">{props.voucherError}</span>
        </p>
      )}
      {props.voucherSuccess && (
        <p role="status" className="flex items-start gap-2 border border-primary-neon/10 bg-primary-neon/5 p-2 text-[10px] text-primary-neon">
          <CheckCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> <span className="break-words">{props.voucherSuccess}</span>
        </p>
      )}
    </section>
  );
}
