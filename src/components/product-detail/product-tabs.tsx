"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import { Beaker, HelpCircle, MessageSquare, ShieldCheck } from "lucide-react";
import type { ProductDetailTab } from "./product-detail.types";

const tabs = [
  { id: "DESCRIPTION", label: "Mô Tả Cấu Trúc", icon: Beaker },
  { id: "SPECIFICATIONS", label: "Chứng Nhận Kiểm Định", icon: ShieldCheck },
  { id: "REVIEWS", label: "Hội Đồng Đánh Giá", icon: MessageSquare },
  { id: "QA", label: "Khảo Sát Q&A", icon: HelpCircle },
] as const;

interface ProductTabsProps {
  activeTab: ProductDetailTab;
  description: string;
  reviewsContent: ReactNode;
  onChange: (tab: ProductDetailTab) => void;
}

export function ProductTabs({ activeTab, description, reviewsContent, onChange }: ProductTabsProps) {
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
    <section className="mb-16 min-w-0 border border-white/5 bg-background-card/30">
      <div role="tablist" aria-label="Thông tin sản phẩm" className="flex max-w-full overflow-x-auto border-b border-white/5 bg-black/10">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button key={tab.id} ref={(element) => { refs.current[index] = element; }} type="button" role="tab" id={`product-tab-${tab.id}`} aria-selected={selected} aria-controls={`product-panel-${tab.id}`} tabIndex={selected ? 0 : -1} onClick={() => onChange(tab.id)} onKeyDown={(event) => onKeyDown(event, index)} className={`flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 text-xs font-bold uppercase tracking-wider focus-visible:bio-focus sm:px-6 ${selected ? "border-primary-neon bg-white/5 text-primary-neon" : "border-transparent text-text-dark hover:text-text-pure"}`}>
              <Icon aria-hidden="true" className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`product-panel-${activeTab}`} aria-labelledby={`product-tab-${activeTab}`} tabIndex={0} className="min-w-0 break-words p-5 leading-relaxed text-text-dark focus-visible:bio-focus sm:p-6">
        {activeTab === "DESCRIPTION" && <p className="font-sans text-xs">{description}</p>}
        {activeTab === "SPECIFICATIONS" && <p>Báo cáo phân tích phòng thí nghiệm đạt tiêu chuẩn an toàn sinh học vô trùng.</p>}
        {activeTab === "QA" && <p>Hệ thống hỏi đáp kỹ thuật nuôi cấy mô nấm cao cấp CyberMushroom.</p>}
        {activeTab === "REVIEWS" && reviewsContent}
      </div>
    </section>
  );
}
