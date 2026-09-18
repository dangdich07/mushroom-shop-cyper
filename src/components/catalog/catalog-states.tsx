import { RotateCcw } from "lucide-react";
import { StatePanel } from "@/components/ui/state-panel";

export function CatalogLoadingState() {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Đang tải danh mục sản phẩm"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="min-h-80 border border-white/10 bg-white/[0.035] animate-pulse motion-reduce:animate-none"
        >
          <span className="sr-only">Đang tải sản phẩm</span>
        </div>
      ))}
    </div>
  );
}

export function CatalogEmptyState() {
  return (
    <StatePanel
      tone="empty"
      title="Không tìm thấy sản phẩm phù hợp"
    />
  );
}

export function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StatePanel
      tone="error"
      title="Không thể tải danh mục. Vui lòng thử lại."
      action={
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 border border-status-danger/40 px-4 font-mono text-[10px] font-black uppercase text-status-danger transition-colors hover:bg-status-danger hover:text-background-deep focus-visible:bio-focus"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Thử lại
        </button>
      }
    />
  );
}
