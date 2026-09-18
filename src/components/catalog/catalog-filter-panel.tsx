import {
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { CatalogSort } from "@/features/catalog/catalog.types";
import type { MushroomCategory } from "@/types/product.types";
import type { CatalogFilterPanelProps } from "./catalog.types";

const CATEGORIES = ["ALL", "MEDICINAL", "FOOD", "EQUIPMENT"] as const;
const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  ALL: "Tất cả sản phẩm",
  MEDICINAL: "Nấm dược liệu",
  FOOD: "Nấm thực phẩm",
  EQUIPMENT: "Thiết bị & phôi nấm",
};

export function CatalogFilterPanel({
  category,
  idPrefix,
  maxPrice,
  minPrice,
  onCategoryChange,
  onMaxPriceChange,
  onMinPriceChange,
  onReset,
  onSearchInputChange,
  onSortChange,
  searchInput,
  showSort = true,
  sort,
}: CatalogFilterPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4">
        <span className="flex items-center gap-2 font-heading text-base font-bold text-text-pure">
          <SlidersHorizontal className="h-4 w-4 text-primary-neon" aria-hidden="true" />
          Bộ lọc
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-xs text-primary-neon transition-colors hover:bg-primary-neon/10 focus-visible:bio-focus"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Xóa tất cả
        </button>
      </div>

      <label htmlFor={`${idPrefix}-search`} className="font-heading text-sm font-semibold text-text-muted">
        Tìm trong danh mục
        <span className="relative mt-2 block">
          <input
            id={`${idPrefix}-search`}
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Tên sản phẩm, SKU..."
            className="min-h-12 w-full rounded-control border border-[var(--color-border-default)] bg-background-dark/70 p-3 pr-10 text-sm text-text-pure outline-none transition-colors placeholder:text-text-dark focus:border-primary-neon focus-visible:bio-focus"
          />
          <Search className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-primary-neon" aria-hidden="true" />
        </span>
      </label>

      <fieldset className="flex flex-col gap-2 border-t border-[var(--color-border-subtle)] pt-5">
        <legend className="mb-2 font-heading text-sm font-semibold text-text-pure">Danh mục</legend>
        {CATEGORIES.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onCategoryChange(item as MushroomCategory | "ALL")}
              aria-pressed={active}
              className={`relative min-h-11 rounded-control border px-3 py-2.5 text-left text-sm transition-colors focus-visible:bio-focus ${
                active
                  ? "border-primary-neon/60 bg-primary-neon/10 font-bold text-primary-neon shadow-[inset_3px_0_0_var(--color-primary-neon)]"
                  : "border-transparent bg-white/[0.025] text-text-muted hover:border-primary-neon/20 hover:bg-primary-neon/[0.04] hover:text-text-pure"
              }`}
            >
              {CATEGORY_LABELS[item]}
              {active && <span className="float-right font-mono text-[9px] uppercase">Đang chọn</span>}
            </button>
          );
        })}
      </fieldset>

      <div className="border-t border-[var(--color-border-subtle)] pt-5">
        <p className="mb-3 font-heading text-sm font-semibold text-text-pure">Khoảng giá</p>
        <div className="grid grid-cols-2 gap-2">
          <PriceInput
            id={`${idPrefix}-min-price`}
            label="Từ"
            value={minPrice}
            onChange={onMinPriceChange}
          />
          <PriceInput
            id={`${idPrefix}-max-price`}
            label="Đến"
            value={maxPrice}
            minimum={minPrice}
            onChange={onMaxPriceChange}
          />
        </div>
      </div>

      {showSort && (
        <label htmlFor={`${idPrefix}-sort`} className="border-t border-[var(--color-border-subtle)] pt-5 font-heading text-sm font-semibold text-text-pure">
          Sắp xếp
          <select
            id={`${idPrefix}-sort`}
            value={sort}
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
            className="mt-2 min-h-12 w-full rounded-control border border-[var(--color-border-default)] bg-background-dark/70 p-2.5 text-sm text-text-pure outline-none focus:border-primary-neon focus-visible:bio-focus"
          >
            <option value="NEWEST">Mới nhất</option>
            <option value="PRICE_ASC">Giá tăng dần</option>
            <option value="PRICE_DESC">Giá giảm dần</option>
          </select>
        </label>
      )}
    </div>
  );
}

function PriceInput({
  id,
  label,
  minimum = 0,
  onChange,
  value,
}: {
  id: string;
  label: string;
  minimum?: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label htmlFor={id} className="font-mono text-[10px] uppercase text-text-dark">
      {label}
      <input
        id={id}
        type="number"
        min={minimum}
        value={value}
        onChange={(event) => onChange(Math.max(minimum, Number(event.target.value)))}
        className="mt-1 min-h-12 w-full min-w-0 rounded-control border border-[var(--color-border-default)] bg-background-dark/70 p-2 text-sm text-text-pure outline-none focus:border-primary-neon focus-visible:bio-focus"
      />
    </label>
  );
}
