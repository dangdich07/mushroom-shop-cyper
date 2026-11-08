"use client";

import { Banknote, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutPaymentMethodsProps } from "./checkout.types";

export function CheckoutPaymentMethods({ disabled, paymentMethod, onChange }: CheckoutPaymentMethodsProps) {
  return (
    <fieldset className="glass-premium min-w-0 border-white/5 p-4 sm:p-5" disabled={disabled}>
      <legend className="sr-only">Phương thức thanh toán</legend>
      <h2 className="mb-4 flex items-center gap-1.5 border-b border-white/5 pb-2 text-[10px] font-bold uppercase text-primary-cyan">
        <CreditCard aria-hidden="true" className="h-4 w-4" /> Phương thức thanh toán
      </h2>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <PaymentOption checked={paymentMethod === "VIETQR"} disabled={disabled} value="VIETQR" title="VietQR" description={<>Quét mã QR bằng ứng dụng ngân hàng để thanh toán sau khi đặt hàng.</>} icon={<QrCode aria-hidden="true" className="h-6 w-6 shrink-0 text-primary-cyan" />} onChange={() => onChange("VIETQR")} />
        <PaymentOption checked={paymentMethod === "COD"} disabled={disabled} value="COD" title="Thanh toán khi nhận hàng (COD)" description={<>Thanh toán bằng tiền mặt khi nhận hàng.</>} icon={<Banknote aria-hidden="true" className="h-6 w-6 shrink-0 text-primary-cyan" />} onChange={() => onChange("COD")} />
      </div>
    </fieldset>
  );
}

function PaymentOption({ checked, description, disabled, icon, onChange, title, value }: { checked: boolean; description: React.ReactNode; disabled: boolean; icon: React.ReactNode; onChange: () => void; title: string; value: "VIETQR" | "COD" }) {
  return (
    <label className={cn("relative flex min-w-0 cursor-pointer items-start gap-3 border p-4 focus-within:bio-focus", checked ? "border-primary-cyan bg-primary-cyan/5" : "border-white/10 bg-transparent hover:border-white/20", disabled && "cursor-not-allowed opacity-50")}>
      <input type="radio" name="paymentMethod" value={value} checked={checked} disabled={disabled} onChange={onChange} className="mt-1 h-5 w-5 shrink-0 accent-primary-cyan" />
      <span className="min-w-0 flex-1">
        <span className="mb-1 flex min-w-0 items-center gap-2 text-text-pure">{icon}<strong className="break-words font-black uppercase tracking-wide">{title}</strong></span>
        <span className="block break-words text-[10px] text-text-dark">{description}</span>
      </span>
    </label>
  );
}
