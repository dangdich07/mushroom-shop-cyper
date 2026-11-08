"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import { Beaker, CircleHelp, Dna, HelpCircle, MessageSquare, PackageCheck, Scale, ShieldCheck } from "lucide-react";
import type { ProductVariant } from "@/types/product.types";
import type { ProductDetailData, ProductDetailTab } from "./product-detail.types";

const tabs = [
  { id: "DESCRIPTION", label: "Mô tả", icon: Beaker },
  { id: "SPECIFICATIONS", label: "Thông số", icon: ShieldCheck },
  { id: "QA", label: "Hỏi đáp", icon: HelpCircle },
  { id: "REVIEWS", label: "Đánh giá", icon: MessageSquare },
] as const;

interface ProductTabsProps {
  activeTab: ProductDetailTab;
  product: ProductDetailData;
  selectedVariant?: ProductVariant;
  reviewsContent: ReactNode;
  onChange: (tab: ProductDetailTab) => void;
}

export function ProductTabs({ activeTab, product, selectedVariant, reviewsContent, onChange }: ProductTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activate = (index: number) => {
    const tab = tabs[index];
    onChange(tab.id);
    refs.current[index]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== null) {
      event.preventDefault();
      activate(next);
    }
  };

  return (
    <section className="mb-14 min-w-0 overflow-hidden rounded-[14px] border border-primary-neon/20 bg-surface-glass shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:mb-16">
      <div role="tablist" aria-label="Thông tin sản phẩm" className="flex max-w-full overflow-x-auto border-b border-primary-neon/15 bg-background-dark/35 px-2 sm:px-4">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button key={tab.id} ref={(element) => { refs.current[index] = element; }} type="button" role="tab" id={`product-tab-${tab.id}`} aria-selected={selected} aria-controls={`product-panel-${tab.id}`} tabIndex={selected ? 0 : -1} onClick={() => onChange(tab.id)} onKeyDown={(event) => onKeyDown(event, index)} className={`relative flex min-h-14 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 font-heading text-sm font-semibold transition-colors focus-visible:bio-focus sm:px-7 ${selected ? "border-primary-neon bg-primary-neon/[0.05] text-primary-neon" : "border-transparent text-text-dark hover:text-text-pure"}`}>
              <Icon aria-hidden="true" className="h-4 w-4" /> {tab.label}
              {tab.id === "REVIEWS" ? <span className="font-mono text-[9px] text-text-dark">({product.totalReviews})</span> : null}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`product-panel-${activeTab}`} aria-labelledby={`product-tab-${activeTab}`} tabIndex={0} className="min-w-0 break-words p-5 text-text-muted focus-visible:bio-focus sm:p-8 lg:p-10">
        {activeTab === "DESCRIPTION" && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-neon">Thông tin từ dữ liệu sản phẩm</p>
              <h2 className="mt-3 max-w-2xl font-heading text-2xl font-bold leading-tight text-text-pure sm:text-3xl">{product.name}</h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-muted sm:text-base sm:leading-8">{product.shortDescription}</p>
            </div>
            <div className="rounded-[10px] border border-primary-neon/15 bg-background-dark/35 p-5">
              <Dna aria-hidden="true" className="h-7 w-7 text-primary-neon" />
              <p className="mt-4 font-heading text-sm font-semibold text-text-pure">Danh pháp khoa học</p>
              <p className="mt-1 break-words text-sm italic text-text-muted">{product.scientificName || "Chưa cập nhật"}</p>
              {product.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.tags.map((tag) => <span key={tag} className="rounded-pill border border-primary-neon/20 bg-primary-neon/[0.05] px-3 py-1 font-mono text-[9px] text-primary-neon">{tag}</span>)}
                </div>
              ) : null}
            </div>
          </div>
        )}
        {activeTab === "SPECIFICATIONS" && (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "SKU", value: selectedVariant?.sku ?? product.sku, icon: PackageCheck },
              { label: "Danh mục", value: product.category, icon: Beaker },
              { label: "Biến thể", value: selectedVariant?.name ?? "Mặc định", icon: ShieldCheck },
              { label: "Khối lượng", value: selectedVariant?.weightGrams ? `${selectedVariant.weightGrams}g` : "Chưa cập nhật", icon: Scale },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[10px] border border-primary-neon/15 bg-background-dark/35 p-5">
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary-neon" />
                  <dt className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dark">{item.label}</dt>
                  <dd className="mt-1 break-words font-heading text-sm font-semibold text-text-pure">{item.value}</dd>
                </div>
              );
            })}
          </dl>
        )}
        {activeTab === "QA" && (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-[10px] border border-dashed border-primary-neon/20 bg-background-dark/25 px-5 text-center">
            <CircleHelp aria-hidden="true" className="h-8 w-8 text-primary-neon" />
            <h2 className="mt-4 font-heading text-lg font-semibold text-text-pure">Chưa có câu hỏi công khai</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-text-dark">Các câu hỏi về sản phẩm sẽ xuất hiện tại đây khi có dữ liệu.</p>
          </div>
        )}
        {activeTab === "REVIEWS" && reviewsContent}
      </div>
    </section>
  );
}
