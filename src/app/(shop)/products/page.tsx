"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CatalogFilterPanel } from "@/components/catalog/catalog-filter-panel";
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
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import type { MushroomCategory, Product } from "@/types/product.types";

const PAGE_SIZE = 9;

export default function ProductsPage() {
  const addToast = useOverlayStore((state) => state.addToast);
  const addItem = useCartStore((state) => state.addItem);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [category, setCategory] = useState<MushroomCategory | "ALL">("ALL");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10_000_000);
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
      Number(maxPrice !== 10_000_000) +
      Number(sort !== "NEWEST"),
    [category, maxPrice, minPrice, search, sort],
  );

  function resetFilters() {
    setSearchInput("");
    setCategory("ALL");
    setMinPrice(0);
    setMaxPrice(10_000_000);
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
      <div className="relative min-h-screen border-b border-white/5 py-8 sm:py-10">
        <Container>
          <header className="relative mb-8 overflow-hidden border-b border-white/5 pb-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 top-0 h-36 w-72 bg-primary-neon/[0.045] blur-3xl"
            />
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">
              Sàn giao dịch vật phẩm
            </span>
            <h1 className="relative max-w-4xl break-words font-heading text-[clamp(2rem,6vw,3.5rem)] font-black uppercase leading-tight tracking-[-0.035em] text-text-pure">
              Hệ thống danh mục toàn cầu
            </h1>
          </header>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4 lg:gap-8">
            <aside className="glass-premium hidden p-5 lg:sticky lg:top-24 lg:block">
              <CatalogFilterPanel
                idPrefix="desktop-catalog"
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
            </aside>

            <section ref={resultsTopRef} className="flex min-w-0 scroll-mt-24 flex-col gap-6 lg:col-span-3">
              <CatalogToolbar
                activeFilterCount={activeFilterCount}
                onOpenFilters={() => setIsMobileFiltersOpen(true)}
                onViewModeChange={setViewMode}
                total={catalog.data?.total ?? 0}
                viewMode={viewMode}
              />

              <div className="border-y border-white/5 py-3">
                <CatalogPagination
                  ariaLabel="Phân trang đầu danh mục"
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              </div>

              {catalog.isLoading ? (
                <CatalogLoadingState />
              ) : catalog.isError ? (
                <CatalogErrorState onRetry={() => void catalog.refetch()} />
              ) : catalog.data?.items.length ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
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
                <CatalogEmptyState />
              )}

              <CatalogPagination
                ariaLabel="Phân trang cuối danh mục"
                currentPage={page}
                totalPages={totalPages}
                onPageChange={changePage}
              />
            </section>
          </div>
        </Container>
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
