import { LayoutGrid, List, LoaderCircle, Search, SlidersHorizontal } from "lucide-react";
import type { CatalogSort } from "@/features/catalog/catalog.types";

interface CatalogToolbarProps {
  activeFilterCount: number;
  isUpdating: boolean;
  onOpenFilters: () => void;
  onSearchInputChange: (value: string) => void;
  onSortChange: (value: CatalogSort) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  searchInput: string;
  sort: CatalogSort;
  total: number;
  viewMode: "grid" | "list";
}

export function CatalogToolbar({
  activeFilterCount,
  isUpdating,
  onOpenFilters,
  onSearchInputChange,
  onSortChange,
  onViewModeChange,
  searchInput,
  sort,
  total,
  viewMode,
}: CatalogToolbarProps) {
  return (
    <div className="rounded-[12px] border border-primary-neon/15 bg-surface-glass/90 p-3 shadow-surface-1 backdrop-blur-xl sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative flex min-h-12 min-w-0 flex-1 items-center xl:max-w-[32rem]">
          <span className="sr-only">Tìm sản phẩm theo tên hoặc SKU</span>
          <Search className="pointer-events-none absolute left-4 h-[18px] w-[18px] text-primary-neon" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Tìm sản phẩm, tên khoa học hoặc SKU..."
            className="min-h-12 w-full rounded-control border border-[var(--color-border-default)] bg-background-dark/75 py-3 pl-11 pr-4 text-sm text-text-pure outline-none transition-colors placeholder:text-text-dark focus:border-primary-neon focus-visible:bio-focus"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          aria-label={`Mở bộ lọc${activeFilterCount ? `, ${activeFilterCount} bộ lọc đang áp dụng` : ""}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-[var(--color-border-default)] bg-background-dark/65 px-3 font-heading text-xs font-bold text-text-muted transition-colors hover:border-primary-neon/40 hover:text-primary-neon focus-visible:bio-focus lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary-neon px-1.5 py-0.5 font-mono text-[9px] text-background-deep">
              {activeFilterCount}
            </span>
          )}
        </button>

          <label className="flex min-h-11 items-center gap-2 text-xs text-text-dark">
            <span className="hidden sm:inline">Sắp xếp</span>
            <select
              aria-label="Sắp xếp danh mục"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as CatalogSort)}
              className="min-h-11 rounded-control border border-[var(--color-border-default)] bg-background-dark/75 px-3 text-sm text-text-pure outline-none focus:border-primary-neon focus-visible:bio-focus"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="PRICE_ASC">Giá tăng dần</option>
              <option value="PRICE_DESC">Giá giảm dần</option>
            </select>
          </label>

          <div className="flex overflow-hidden rounded-control border border-[var(--color-border-default)] bg-background-dark/65" role="group" aria-label="Chế độ hiển thị">
            <ViewButton
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              label="Hiển thị dạng lưới"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </ViewButton>
            <ViewButton
              active={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              label="Hiển thị dạng danh sách"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </ViewButton>
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-7 flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3 text-xs text-text-dark" aria-live="polite">
        <span>
          Hiển thị <b className="text-text-pure">{total}</b> sản phẩm phù hợp
        </span>
        <span className={`inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider ${isUpdating ? "text-primary-neon" : "text-text-dark"}`}>
          {isUpdating && <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {isUpdating ? "Đang cập nhật" : activeFilterCount > 0 ? `${activeFilterCount} bộ lọc đang áp dụng` : "Danh mục trực tiếp"}
        </span>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`relative flex min-h-11 min-w-11 items-center justify-center transition-colors focus-visible:bio-focus ${
        active
          ? "bg-primary-neon text-background-deep shadow-neon-cyan after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:bg-background-deep"
          : "text-text-dark hover:bg-white/5 hover:text-text-pure"
      }`}
    >
      {children}
    </button>
  );
}
