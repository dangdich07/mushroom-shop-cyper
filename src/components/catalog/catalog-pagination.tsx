import { ChevronLeft, ChevronRight } from "lucide-react";

interface CatalogPaginationProps {
  ariaLabel?: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function CatalogPagination({
  ariaLabel = "Phân trang danh mục",
  currentPage,
  onPageChange,
  totalPages,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center justify-center gap-3">
      <PageButton
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </PageButton>
      <span className="border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs text-text-muted">
        Trang <b className="text-primary-neon">{currentPage}</b>/{totalPages}
      </span>
      <PageButton
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex min-h-11 min-w-11 items-center justify-center border border-white/10 text-text-dark transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
