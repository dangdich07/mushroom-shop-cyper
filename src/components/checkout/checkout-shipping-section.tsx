"use client";

import { Truck } from "lucide-react";
import { SavedAddressList } from "./saved-address-list";
import type { CheckoutShippingSectionProps } from "./checkout.types";

const inputClasses = "min-h-11 min-w-0 w-full border border-white/10 bg-background-dark p-2.5 text-text-pure outline-none focus-visible:bio-focus disabled:opacity-50";

export function CheckoutShippingSection({ addresses, disabled, formData, onChange, onSelectAddress }: CheckoutShippingSectionProps) {
  return (
    <section className="glass-premium flex min-w-0 flex-col gap-4 border-white/5 p-4 sm:p-5" aria-labelledby="shipping-section-title">
      <h2 id="shipping-section-title" className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-[10px] font-bold uppercase text-primary-cyan">
        <Truck aria-hidden="true" className="h-4 w-4" /> Tọa độ phòng Lab tiếp nhận sinh khối
      </h2>
      <SavedAddressList addresses={addresses} disabled={disabled} onSelect={onSelectAddress} />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-text-dark uppercase" htmlFor="checkout-shipping-name">
          Họ tên kỹ sư tiếp nhận
          <input id="checkout-shipping-name" name="shippingName" required type="text" autoComplete="name" disabled={disabled} value={formData.shippingName} onChange={(event) => onChange({ ...formData, shippingName: event.target.value })} placeholder="NÔNG ĐẶNG ĐÍCH" className={`${inputClasses} font-bold uppercase`} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-text-dark uppercase" htmlFor="checkout-shipping-phone">
          Tần số liên lạc (Phone)
          <input id="checkout-shipping-phone" name="shippingPhone" required type="tel" autoComplete="tel" disabled={disabled} value={formData.shippingPhone} onChange={(event) => onChange({ ...formData, shippingPhone: event.target.value })} placeholder="0987xxxxxx" className={`${inputClasses} font-bold`} />
        </label>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1.5 text-text-dark uppercase" htmlFor="checkout-shipping-area">
          Đặc khu hành chính
          <select id="checkout-shipping-area" name="shippingArea" autoComplete="address-level1" value={formData.shippingArea} disabled={disabled} onChange={(event) => onChange({ ...formData, shippingArea: event.target.value })} className={`${inputClasses} font-bold uppercase`}>
            <option value="HANOI">MIỀN BẮC // HÀ NỘI HUB</option>
            <option value="DANANG">MIỀN TRUNG // ĐÀ NẴNG HUB</option>
            <option value="HCM">MIỀN NAM // SÀI GÒN HUB</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-text-dark uppercase sm:col-span-2" htmlFor="checkout-shipping-detail">
          Địa chỉ chi tiết phòng Lab
          <input id="checkout-shipping-detail" name="shippingDetail" required type="text" autoComplete="street-address" disabled={disabled} value={formData.shippingDetail} onChange={(event) => onChange({ ...formData, shippingDetail: event.target.value })} placeholder="Số 12, ngõ 34, đường ABC, quận XYZ" className={inputClasses} />
        </label>
      </div>
    </section>
  );
}
