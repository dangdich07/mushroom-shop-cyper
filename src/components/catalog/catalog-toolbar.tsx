import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

interface CatalogToolbarProps {
  activeFilterCount: number;
  onOpenFilters: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  total: number;
  viewMode: "grid" | "list";
}

export function CatalogToolbar({
  activeFilterCount,
  onOpenFilters,
  onViewModeChange,
  total,
  viewMode,
}: CatalogToolbarProps) {
  return (
    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border border-white/5 bg-surface-raised/30 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          aria-label={`Mở bộ lọc${activeFilterCount ? `, ${activeFilterCount} bộ lọc đang áp dụng` : ""}`}
          className="inline-flex min-h-11 items-center gap-2 border border-white/10 px-3 font-mono text-[10px] font-black uppercase text-text-muted transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center bg-primary-neon px-1.5 py-0.5 text-[9px] text-background-deep">
              {activeFilterCount}
            </span>
          )}
        </button>
        <span className="truncate text-xs text-text-dark">
          Kết quả: <b className="text-text-pure">{total}</b>
        </span>
        {activeFilterCount > 0 && (
          <span className="hidden border border-primary-neon/20 bg-primary-neon/[0.06] px-2 py-1 font-mono text-[9px] uppercase text-primary-neon sm:inline">
            {activeFilterCount} bộ lọc đang áp dụng
          </span>
        )}
      </div>

      <div className="flex border border-white/10" role="group" aria-label="Chế độ hiển thị">
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
          ? "bg-primary-neon text-background-deep after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:bg-background-deep"
          : "text-text-dark hover:bg-white/5 hover:text-text-pure"
      }`}
    >
      {children}
    </button>
  );
}
