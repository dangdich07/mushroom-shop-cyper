"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { CatalogFilterPanel } from "@/components/catalog/catalog-filter-panel";
import { CatalogHero } from "@/components/catalog/catalog-hero";
import { CatalogMobileFilters } from "@/components/catalog/catalog-mobile-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import {
  CatalogEmptyState,
  CatalogErrorState,
  CatalogLoadingState,
} from "@/components/catalog/catalog-states";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { getCatalogProducts } from "@/features/catalog/catalogRepository";
import type { CatalogFilters, CatalogSort } from "@/features/catalog/catalog.types";
import { useDebouncedValue } from "@/features/catalog/useDebouncedValue";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import type { MushroomCategory, Product } from "@/types/product.types";

const PAGE_SIZE = 9;
const DEFAULT_MAX_PRICE = 10_000_000;
const CATEGORY_LABELS: Record<MushroomCategory, string> = {
  MEDICINAL: "Nấm dược liệu",
  FOOD: "Nấm thực phẩm",
  EQUIPMENT: "Thiết bị & phôi nấm",
};

export default function ProductsPage() {
  const addToast = useOverlayStore((state) => state.addToast);
  const addItem = useCartStore((state) => state.addItem);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [category, setCategory] = useState<MushroomCategory | "ALL">("ALL");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [sort, setSort] = useState<CatalogSort>("NEWEST");
  const [page, setPage] = useState(1);
  const resultsTopRef = useRef<HTMLElement>(null);

  useEffect(() => setPage(1), [search, category, minPrice, maxPrice, sort]);

  const filters = useMemo<CatalogFilters>(
    () => ({ category, search, minPrice, maxPrice, sort, page, pageSize: PAGE_SIZE }),
    [category, search, minPrice, maxPrice, sort, page],
  );
  const catalog = useQuery({
    queryKey: ["catalog", filters],
    queryFn: () => getCatalogProducts(filters),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  });
  const totalPages = Math.max(1, Math.ceil((catalog.data?.total ?? 0) / PAGE_SIZE));
  const activeFilterCount = useMemo(
    () =>
      Number(search.trim().length > 0) +
      Number(category !== "ALL") +
      Number(minPrice !== 0) +
      Number(maxPrice !== DEFAULT_MAX_PRICE) +
      Number(sort !== "NEWEST"),
    [category, maxPrice, minPrice, search, sort],
  );

  function resetFilters() {
    setSearchInput("");
    setCategory("ALL");
    setMinPrice(0);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSort("NEWEST");
    setPage(1);
  }

  function changePage(nextPage: number) {
    if (nextPage === page) return;
    setPage(nextPage);
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultsTopRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function addToCart(product: Product) {
    const variant = product.defaultVariant;
    if (!variant) {
      addToast({ title: "KHÔNG KHẢ DỤNG", description: "Sản phẩm chưa có biến thể đang bán.", type: "ERROR" });
      return;
    }
    addItem(
      {
        id: product.id,
        lineId: variant.id,
        variantId: variant.id,
        variantName: variant.name,
        name: product.name,
        price: variant.price,
        image: product.image,
        sku: variant.sku,
      },
      1,
    );
    addToast({
      title: "NẠP SINH KHỐI",
      description: `Đã thêm ${product.name} vào giỏ hàng.`,
      type: "SUCCESS",
    });
  }

  return (
    <PageWrapper>
      <div className="relative min-h-screen overflow-hidden border-b border-[var(--color-border-subtle)] bg-background-deep">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(0,245,255,0.09),transparent_24%),radial-gradient(circle_at_12%_58%,rgba(14,165,233,0.055),transparent_28%),linear-gradient(rgba(0,245,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.025)_1px,transparent_1px)] bg-[size:auto,auto,48px_48px,48px_48px]"
        />

        <CatalogHero />

        <section className="relative py-6 sm:py-7 lg:py-8">
          <Container wide>
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:gap-7">
              <aside className="hidden rounded-[12px] border border-primary-neon/20 bg-surface-glass/90 p-5 shadow-surface-1 backdrop-blur-xl lg:sticky lg:top-24 lg:block">
                <CatalogFilterPanel
                  idPrefix="desktop-catalog"
                  category={category}
                  maxPrice={maxPrice}
                  minPrice={minPrice}
                  searchInput={searchInput}
                  showSort={false}
                  sort={sort}
                  onCategoryChange={setCategory}
                  onMaxPriceChange={setMaxPrice}
                  onMinPriceChange={setMinPrice}
                  onReset={resetFilters}
                  onSearchInputChange={setSearchInput}
                  onSortChange={setSort}
                />

                <div className="mt-6 rounded-[10px] border border-primary-neon/15 bg-primary-neon/[0.04] p-4">
                  <p className="font-heading text-sm font-bold text-text-pure">Danh mục trực tiếp</p>
                  <p className="mt-2 text-xs leading-5 text-text-dark">
                    Kết quả được tải từ kho sản phẩm và cập nhật theo bộ lọc bạn chọn.
                  </p>
                </div>
              </aside>

              <section ref={resultsTopRef} className="flex min-w-0 scroll-mt-24 flex-col gap-5">
                <CatalogToolbar
                  activeFilterCount={activeFilterCount}
                  isUpdating={catalog.isFetching && !catalog.isLoading}
                  onOpenFilters={() => setIsMobileFiltersOpen(true)}
                  onSearchInputChange={setSearchInput}
                  onSortChange={setSort}
                  onViewModeChange={setViewMode}
                  searchInput={searchInput}
                  sort={sort}
                  total={catalog.data?.total ?? 0}
                  viewMode={viewMode}
                />

                {activeFilterCount > 0 ? (
                  <div className="flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang áp dụng">
                    {search.trim() ? (
                      <FilterChip label={`“${search.trim()}”`} onRemove={() => setSearchInput("")} />
                    ) : null}
                    {category !== "ALL" ? (
                      <FilterChip label={CATEGORY_LABELS[category]} onRemove={() => setCategory("ALL")} />
                    ) : null}
                    {minPrice !== 0 || maxPrice !== DEFAULT_MAX_PRICE ? (
                      <FilterChip
                        label={`${formatVND(minPrice)} – ${formatVND(maxPrice)}`}
                        onRemove={() => {
                          setMinPrice(0);
                          setMaxPrice(DEFAULT_MAX_PRICE);
                        }}
                      />
                    ) : null}
                    {sort !== "NEWEST" ? (
                      <FilterChip
                        label={sort === "PRICE_ASC" ? "Giá tăng dần" : "Giá giảm dần"}
                        onRemove={() => setSort("NEWEST")}
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="min-h-11 rounded-control px-3 text-xs font-semibold text-text-dark transition-colors hover:text-primary-neon focus-visible:bio-focus"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                ) : null}

                {catalog.isLoading ? (
                  <CatalogLoadingState viewMode={viewMode} />
                ) : catalog.isError ? (
                  <CatalogErrorState onRetry={() => void catalog.refetch()} />
                ) : catalog.data?.items.length ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
                        : "flex min-w-0 flex-col gap-4"
                    }
                  >
                    {catalog.data.items.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        list={viewMode === "list"}
                        onAdd={() => addToCart(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <CatalogEmptyState onReset={resetFilters} />
                )}

                {totalPages > 1 ? (
                  <div className="rounded-[12px] border border-[var(--color-border-subtle)] bg-surface-glass/70 px-3 py-4 backdrop-blur-lg sm:px-5">
                    <CatalogPagination
                      ariaLabel="Phân trang danh mục sản phẩm"
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={changePage}
                    />
                  </div>
                ) : null}
              </section>
            </div>
          </Container>
        </section>
      </div>

      <CatalogMobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        category={category}
        maxPrice={maxPrice}
        minPrice={minPrice}
        searchInput={searchInput}
        sort={sort}
        onCategoryChange={setCategory}
        onMaxPriceChange={setMaxPrice}
        onMinPriceChange={setMinPrice}
        onReset={resetFilters}
        onSearchInputChange={setSearchInput}
        onSortChange={setSort}
      />
    </PageWrapper>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Bỏ bộ lọc ${label}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-neon/35 bg-primary-neon/[0.07] px-3 font-mono text-[10px] text-primary-neon transition-colors hover:bg-primary-neon hover:text-background-deep focus-visible:bio-focus"
    >
      {label}
      <X className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
