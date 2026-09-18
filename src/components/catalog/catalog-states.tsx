import { RotateCcw, SearchX } from "lucide-react";
import { StatePanel } from "@/components/ui/state-panel";

export function CatalogLoadingState({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-4"
      }
      role="status"
      aria-label="Đang tải danh mục sản phẩm"
    >
      {Array.from({ length: viewMode === "grid" ? 6 : 4 }, (_, index) => (
        <div
          key={index}
          className={`overflow-hidden rounded-[12px] border border-primary-neon/10 bg-surface-glass/70 animate-pulse motion-reduce:animate-none ${
            viewMode === "list" ? "grid min-h-64 grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)]" : "min-h-[25rem]"
          }`}
        >
          <div className={`${viewMode === "list" ? "min-h-52 md:min-h-full" : "aspect-[16/10]"} bg-primary-neon/[0.06]`} />
          <div className="space-y-4 p-5">
            <div className="h-3 w-24 rounded bg-primary-neon/10" />
            <div className="h-5 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
            <div className="mt-8 h-11 w-full rounded-control bg-primary-neon/10" />
          </div>
          <span className="sr-only">Đang tải sản phẩm</span>
        </div>
      ))}
    </div>
  );
}

export function CatalogEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <StatePanel
      tone="empty"
      icon={<SearchX className="h-6 w-6" />}
      title="Không tìm thấy sản phẩm phù hợp"
      description="Hãy thử thay đổi từ khóa, danh mục hoặc khoảng giá đang áp dụng."
      className="rounded-[12px] border-primary-neon/15 bg-surface-glass/75"
      action={
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-primary-neon/50 px-4 font-heading text-xs font-bold text-primary-neon transition-colors hover:bg-primary-neon hover:text-background-deep focus-visible:bio-focus"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Xóa bộ lọc
        </button>
      }
    />
  );
}

export function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StatePanel
      tone="error"
      title="Không thể tải danh mục. Vui lòng thử lại."
      description="Kết nối dữ liệu đang bị gián đoạn. Bộ lọc hiện tại vẫn được giữ nguyên."
      className="rounded-[12px] bg-surface-glass/75"
      action={
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-status-danger/40 px-4 font-heading text-xs font-bold text-status-danger transition-colors hover:bg-status-danger hover:text-background-deep focus-visible:bio-focus"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Thử lại
        </button>
      }
    />
  );
}
