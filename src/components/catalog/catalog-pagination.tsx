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

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center justify-center gap-2">
      <PageButton
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Trước</span>
      </PageButton>

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="inline-flex min-h-11 min-w-8 items-center justify-center font-mono text-xs text-text-dark"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Trang ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border font-mono text-xs font-bold transition-colors focus-visible:bio-focus ${
              item === currentPage
                ? "border-primary-neon bg-primary-neon text-background-deep shadow-neon-cyan"
                : "border-[var(--color-border-default)] bg-surface-glass text-text-muted hover:border-primary-neon/50 hover:text-primary-neon"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <PageButton
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        label="Trang sau"
      >
        <span className="hidden sm:inline">Tiếp</span>
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
      className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-control border border-[var(--color-border-default)] bg-surface-glass px-3 font-heading text-xs font-semibold text-text-muted transition-colors hover:border-primary-neon/50 hover:text-primary-neon focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}
