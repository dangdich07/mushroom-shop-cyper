"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
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

export default function ProductsPage() {
  const addToast = useOverlayStore((state) => state.addToast);
  const addItem = useCartStore((state) => state.addItem);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [category, setCategory] = useState<MushroomCategory | "ALL">("ALL");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10_000_000);
  const [sort, setSort] = useState<CatalogSort>("NEWEST");
  const [page, setPage] = useState(1);

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

  function resetFilters() {
    setSearchInput("");
    setCategory("ALL");
    setMinPrice(0);
    setMaxPrice(10_000_000);
    setSort("NEWEST");
    setPage(1);
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
      <div className="relative min-h-screen py-10 border-b border-white/5">
        <Container>
          <header className="mb-8 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">
              Sàn giao dịch vật phẩm
            </span>
            <h1 className="text-3xl font-heading font-black uppercase text-text-pure">
              Hệ thống danh mục toàn cầu
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <aside className="glass-premium p-5 flex flex-col gap-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="flex items-center gap-2 font-heading font-bold text-sm uppercase">
                  <SlidersHorizontal className="w-4 h-4 text-primary-neon" /> Bộ lọc
                </span>
                <button onClick={resetFilters} className="text-xs text-text-dark hover:text-primary-neon">
                  <RotateCcw className="inline w-3 h-3" /> Reset
                </button>
              </div>

              <label className="text-xs text-text-dark uppercase">
                Tìm theo tên hoặc SKU
                <span className="relative block mt-2">
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="w-full bg-background-dark border border-white/10 p-3 pr-9 text-text-pure outline-none focus:border-primary-neon"
                  />
                  <Search className="absolute right-3 top-3 w-4 h-4" />
                </span>
              </label>

              <div className="flex flex-col gap-1.5">
                {(["ALL", "MEDICINAL", "FOOD", "EQUIPMENT"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`text-left p-2.5 text-xs border ${
                      category === item
                        ? "border-primary-neon text-primary-neon bg-primary-neon/10"
                        : "border-transparent text-text-dark bg-white/5"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <PriceInput label="Giá từ" value={minPrice} onChange={setMinPrice} />
                <PriceInput label="Đến" value={maxPrice} onChange={setMaxPrice} minimum={minPrice} />
              </div>

              <label className="text-[10px] text-text-dark uppercase">
                Sắp xếp
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as CatalogSort)}
                  className="mt-1 w-full bg-background-dark border border-white/10 p-2.5 text-text-pure"
                >
                  <option value="NEWEST">Mới nhất</option>
                  <option value="PRICE_ASC">Giá tăng dần</option>
                  <option value="PRICE_DESC">Giá giảm dần</option>
                </select>
              </label>
            </aside>

            <section className="lg:col-span-3 flex flex-col gap-6">
              <div className="border border-white/5 p-3 flex justify-between">
                <span className="text-xs text-text-dark">
                  Kết quả: <b className="text-text-pure">{catalog.data?.total ?? 0}</b>
                </span>
                <div>
                  <ViewButton active={viewMode === "grid"} onClick={() => setViewMode("grid")} label="Hiển thị dạng lưới">
                    <LayoutGrid className="w-4 h-4" />
                  </ViewButton>
                  <ViewButton active={viewMode === "list"} onClick={() => setViewMode("list")} label="Hiển thị dạng danh sách">
                    <List className="w-4 h-4" />
                  </ViewButton>
                </div>
              </div>

              {catalog.isLoading ? (
                <CatalogSkeleton />
              ) : catalog.isError ? (
                <div className="border border-red-500/30 p-8 text-red-400">
                  <AlertTriangle className="inline w-4 h-4 mr-2" />
                  Không thể tải danh mục. Vui lòng thử lại.
                </div>
              ) : catalog.data?.items.length ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                  {catalog.data.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      list={viewMode === "list"}
                      onAdd={() => addToCart(product)}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-white/10 py-20 text-center text-text-dark uppercase">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <PageButton disabled={page <= 1} onClick={() => setPage((value) => value - 1)} label="Trang trước">
                    <ChevronLeft className="w-4 h-4" />
                  </PageButton>
                  <span className="text-xs">Trang {page}/{totalPages}</span>
                  <PageButton disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} label="Trang sau">
                    <ChevronRight className="w-4 h-4" />
                  </PageButton>
                </div>
              )}
            </section>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}

function PriceInput({ label, value, onChange, minimum = 0 }: { label: string; value: number; onChange: (value: number) => void; minimum?: number }) {
  return (
    <label className="text-[10px] text-text-dark uppercase">
      {label}
      <input
        type="number"
        min={minimum}
        value={value}
        onChange={(event) => onChange(Math.max(minimum, Number(event.target.value)))}
        className="mt-1 w-full bg-background-dark border border-white/10 p-2 text-text-pure"
      />
    </label>
  );
}

function ViewButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return <button onClick={onClick} aria-label={label} className={`p-2 ${active ? "bg-primary-neon text-background-deep" : "text-text-dark"}`}>{children}</button>;
}

function PageButton({ disabled, onClick, label, children }: { disabled: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return <button disabled={disabled} onClick={onClick} aria-label={label} className="border border-white/10 p-2 disabled:opacity-30">{children}</button>;
}

function CatalogSkeleton() {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 bg-white/5 animate-pulse border border-white/10" />)}</div>;
}

function ProductCard({ product, list, onAdd }: { product: Product; list: boolean; onAdd: () => void }) {
  return (
    <article className={`border border-white/5 bg-background-card/20 flex ${list ? "flex-row" : "flex-col"}`}>
      <Link href={`/products/${product.slug}`} className={`${list ? "w-48" : "w-full"} h-48 bg-black/40 shrink-0`}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80" />
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <span className="text-[9px] text-text-dark">SKU: {product.sku}</span>
        <Link href={`/products/${product.slug}`}><h2 className="font-heading font-black uppercase hover:text-primary-neon">{product.name}</h2></Link>
        <p className="text-[11px] text-text-dark line-clamp-3">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between">
          <b>{formatVND(product.price)}</b>
          <button onClick={onAdd} className="border border-white/10 p-2 hover:text-primary-neon" aria-label={`Thêm ${product.name} vào giỏ`}>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
