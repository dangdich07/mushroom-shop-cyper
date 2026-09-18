"use client";

import { useState, type FormEvent } from "react";
import { Boxes, Save } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { AdminInventoryAdjustment, AdminProduct } from "@/features/admin/products/admin-products.types";
import { formatVND } from "@/lib/utils";

interface Props {
  product: AdminProduct | null;
  pending: boolean;
  onClose: () => void;
  onSave: (adjustment: AdminInventoryAdjustment) => void;
}

export function AdminProductInventoryModal({ product, pending, onClose, onSave }: Props) {
  const [stockByVariant, setStockByVariant] = useState<Record<string, number>>(
    () => Object.fromEntries((product?.variants ?? []).map((variant) => [variant.id, variant.stockQuantity])),
  );
  const [reasonByVariant, setReasonByVariant] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>, variantId: string) {
    event.preventDefault();
    onSave({
      variantId,
      stockQuantity: stockByVariant[variantId],
      reason: reasonByVariant[variantId] ?? "",
    });
  }

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} title="Quản lý tồn kho theo biến thể">
      {product && (
        <div className="min-w-0 font-mono">
          <div className="mb-4 border border-primary-cyan/20 bg-primary-cyan/5 p-3">
            <p className="break-words text-xs font-bold uppercase text-text-pure">{product.name}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
              Chỉ nhập số lượng tồn kho thực tế đã kiểm kê. Số lượng đang giữ thuộc các đơn chưa hoàn tất và không thể sửa tại đây.
            </p>
          </div>

          <div className="grid max-h-[65vh] min-w-0 gap-3 overflow-y-auto pr-1">
            {product.variants.map((variant) => {
              const stock = stockByVariant[variant.id] ?? variant.stockQuantity;
              const available = stock - variant.reservedQuantity;
              const invalid = !Number.isInteger(stock) || stock < variant.reservedQuantity;
              const unchanged = stock === variant.stockQuantity;
              return (
                <form key={variant.id} onSubmit={(event) => submit(event, variant.id)} className="grid min-w-0 grid-cols-1 gap-3 border border-white/10 bg-background-dark/70 p-3 sm:grid-cols-2 sm:items-end">
                  <div className="min-w-0 sm:col-span-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Boxes aria-hidden="true" className="h-4 w-4 text-primary-cyan" />
                      <strong className="break-words text-xs uppercase text-text-pure">{variant.name}</strong>
                      <span className="border border-white/10 px-2 py-0.5 text-[8px] uppercase text-text-muted">{variant.isActive ? "Đang bán" : "Tạm ẩn"}</span>
                    </div>
                    <p className="mt-1 [overflow-wrap:anywhere] text-[9px] text-text-dark">SKU: {variant.sku}</p>
                    <p className="mt-1 text-[10px] text-text-muted">{formatVND(variant.price)}</p>
                    <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] uppercase">
                      <div><dt className="inline text-text-dark">Đang giữ: </dt><dd className="inline font-bold text-amber-400">{variant.reservedQuantity}</dd></div>
                      <div><dt className="inline text-text-dark">Khả dụng: </dt><dd className={`inline font-bold ${available >= 0 ? "text-primary-neon" : "text-red-400"}`}>{available}</dd></div>
                    </dl>
                  </div>

                  <div>
                    <label htmlFor={`stock-${variant.id}`} className="mb-1 block text-[9px] font-bold uppercase text-text-dark">Tồn thực tế</label>
                    <input id={`stock-${variant.id}`} type="number" min={variant.reservedQuantity} step={1} required value={stock} onChange={(event) => setStockByVariant((current) => ({ ...current, [variant.id]: Number(event.target.value) }))} aria-describedby={`stock-help-${variant.id}`} className="min-h-11 w-full border border-white/10 bg-background-deep px-3 text-sm font-bold text-primary-cyan focus-visible:bio-focus" />
                    <p id={`stock-help-${variant.id}`} className="mt-1 text-[8px] text-text-dark">Tối thiểu {variant.reservedQuantity}</p>
                  </div>

                  <div>
                    <label htmlFor={`reason-${variant.id}`} className="mb-1 block text-[9px] font-bold uppercase text-text-dark">Lý do điều chỉnh</label>
                    <input id={`reason-${variant.id}`} required minLength={3} maxLength={500} placeholder="Ví dụ: Kiểm kê nhập kho" value={reasonByVariant[variant.id] ?? ""} onChange={(event) => setReasonByVariant((current) => ({ ...current, [variant.id]: event.target.value }))} className="min-h-11 w-full min-w-0 border border-white/10 bg-background-deep px-3 text-xs text-text-pure placeholder:text-text-dark focus-visible:bio-focus" />
                  </div>

                  <button type="submit" disabled={pending || invalid || unchanged} className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary-cyan px-4 text-[10px] font-bold uppercase text-background-deep focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2">
                    <Save aria-hidden="true" className="h-4 w-4" />{pending ? "Đang lưu" : "Lưu tồn"}
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
