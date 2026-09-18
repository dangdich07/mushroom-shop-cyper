"use client";

import { MapPin } from "lucide-react";
import type { SavedAddressListProps } from "./checkout.types";

export function SavedAddressList({ addresses, disabled, onSelect }: SavedAddressListProps) {
  if (addresses.length === 0) return null;

  return (
    <section className="min-w-0 border border-white/5 bg-white/[0.02] p-3" aria-labelledby="saved-addresses-title">
      <h3 id="saved-addresses-title" className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-text-dark">
        <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary-neon" /> Chọn nhanh tọa độ phòng Lab đã lưu:
      </h3>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        {addresses.map((address) => (
          <button key={address.id} type="button" disabled={disabled} onClick={() => onSelect(address)} title={`${address.name} - ${address.detail}`} className="min-h-11 min-w-0 border border-white/10 bg-background-dark px-3 py-2 text-left text-[10px] text-text-pure hover:border-primary-cyan focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-45">
            <strong className="block break-words uppercase">🏢 {address.name}</strong>
            <span className="mt-1 block break-words text-[9px] uppercase text-text-dark">{address.area} · {address.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
