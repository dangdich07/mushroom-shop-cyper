import {
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { CatalogSort } from "@/features/catalog/catalog.types";
import type { MushroomCategory } from "@/types/product.types";
import type { CatalogFilterPanelProps } from "./catalog.types";

const CATEGORIES = ["ALL", "MEDICINAL", "FOOD", "EQUIPMENT"] as const;

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
  sort,
}: CatalogFilterPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="flex items-center gap-2 font-heading text-sm font-bold uppercase text-text-pure">
          <SlidersHorizontal className="h-4 w-4 text-primary-neon" aria-hidden="true" />
          Bộ lọc
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs text-text-dark transition-colors hover:text-primary-neon focus-visible:bio-focus"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      <label htmlFor={`${idPrefix}-search`} className="text-xs uppercase text-text-dark">
        Tìm theo tên hoặc SKU
        <span className="relative mt-2 block">
          <input
            id={`${idPrefix}-search`}
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            className="min-h-11 w-full border border-white/10 bg-background-dark p-3 pr-10 text-text-pure outline-none transition-colors focus:border-primary-neon focus-visible:bio-focus"
          />
          <Search className="pointer-events-none absolute right-3 top-3.5 h-4 w-4" aria-hidden="true" />
        </span>
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="sr-only">Danh mục sản phẩm</legend>
        {CATEGORIES.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onCategoryChange(item as MushroomCategory | "ALL")}
              aria-pressed={active}
              className={`relative min-h-11 border p-2.5 text-left text-xs transition-colors focus-visible:bio-focus ${
                active
                  ? "border-primary-neon bg-primary-neon/10 font-black text-primary-neon before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:bg-primary-neon"
                  : "border-transparent bg-white/5 text-text-dark hover:border-white/10 hover:text-text-pure"
              }`}
            >
              {item}
              {active && <span className="float-right font-mono text-[9px]">Đang chọn</span>}
            </button>
          );
        })}
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <PriceInput
          id={`${idPrefix}-min-price`}
          label="Giá từ"
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

      <label htmlFor={`${idPrefix}-sort`} className="text-[10px] uppercase text-text-dark">
        Sắp xếp
        <select
          id={`${idPrefix}-sort`}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as CatalogSort)}
          className="mt-1 min-h-11 w-full border border-white/10 bg-background-dark p-2.5 text-text-pure outline-none focus:border-primary-neon focus-visible:bio-focus"
        >
          <option value="NEWEST">Mới nhất</option>
          <option value="PRICE_ASC">Giá tăng dần</option>
          <option value="PRICE_DESC">Giá giảm dần</option>
        </select>
      </label>
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
    <label htmlFor={id} className="text-[10px] uppercase text-text-dark">
      {label}
      <input
        id={id}
        type="number"
        min={minimum}
        value={value}
        onChange={(event) => onChange(Math.max(minimum, Number(event.target.value)))}
        className="mt-1 min-h-11 w-full min-w-0 border border-white/10 bg-background-dark p-2 text-text-pure outline-none focus:border-primary-neon focus-visible:bio-focus"
      />
    </label>
  );
}
