"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface CommandProduct {
  id: string;
  image: string;
  name: string;
  price: number;
  scientificName?: string;
  sku: string;
  slug: string;
}

interface ProductSearchRow {
  id: string;
  image: string | null;
  name: string;
  price: number | string;
  scientific_name: string | null;
  sku: string;
  slug: string;
}

function sanitizeSearch(value: string) {
  return value.replace(/[%_,().]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

export const CommandMenu = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canOpen = () => document.body.style.overflow !== "hidden";
    const openMenu = () => {
      if (!canOpen()) return;
      setQuery("");
      setIsOpen(true);
    };
    const toggleMenu = () => {
      setIsOpen((current) => {
        if (current) return false;
        if (!canOpen()) return current;
        setQuery("");
        return true;
      });
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleMenu();
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("open-cyber-search", openMenu);
    window.addEventListener("toggle-cyber-search", toggleMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-cyber-search", openMenu);
      window.removeEventListener("toggle-cyber-search", toggleMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    const search = sanitizeSearch(query);
    if (!search) {
      setResults([]);
      setIsLoading(false);
      setSearchError(false);
      return;
    }

    setIsLoading(true);
    setSearchError(false);
    let cancelled = false;
    const delayDebounce = window.setTimeout(async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, scientific_name, price, image, sku")
        .eq("in_stock", true)
        .or(`name.ilike.%${search}%,sku.ilike.%${search}%,scientific_name.ilike.%${search}%`)
        .order("name", { ascending: true })
        .limit(8);

      if (cancelled) return;
      if (error) {
        setResults([]);
        setSearchError(true);
      } else {
        setResults(
          ((data ?? []) as ProductSearchRow[]).map((product) => ({
            id: product.id,
            image: product.image ?? "",
            name: product.name,
            price: Number(product.price),
            scientificName: product.scientific_name ?? undefined,
            sku: product.sku,
            slug: product.slug,
          })),
        );
      }
      setIsLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(delayDebounce);
    };
  }, [query]);

  if (!isOpen) return null;

  const handleNavigate = (slug: string) => {
    setIsOpen(false);
    router.push(`/products/${slug}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm sản phẩm"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background-deep/80 px-4 pt-[12vh] backdrop-blur-md animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden border border-white/10 bg-background-dark font-mono text-xs shadow-2xl shadow-neon-cyan/10">
        <div className="flex items-center gap-3 border-b border-white/10 bg-black/20 p-4">
          <Search className="h-5 w-5 shrink-0 text-primary-cyan" aria-hidden="true" />
          <label htmlFor="global-product-search" className="sr-only">
            Tìm theo tên, SKU hoặc danh pháp khoa học
          </label>
          <input
            id="global-product-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập tên nấm, mã SKU hoặc danh pháp khoa học..."
            className="min-h-11 w-full bg-transparent text-sm text-text-pure outline-none placeholder:text-text-dark focus-visible:bio-focus"
          />
          {isLoading ? (
            <Loader2
              className="h-4 w-4 shrink-0 animate-spin text-primary-neon motion-reduce:animate-none"
              aria-label="Đang tìm kiếm"
            />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa nội dung tìm kiếm"
              className="flex min-h-10 min-w-10 items-center justify-center text-text-dark transition-colors hover:text-text-pure focus-visible:bio-focus"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="select-none border border-white/10 bg-white/5 px-2 py-1 text-[9px] text-text-dark"
            >
              ESC
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng tìm kiếm"
            className="flex min-h-10 min-w-10 items-center justify-center border-l border-white/10 text-text-dark transition-colors hover:text-primary-neon focus-visible:bio-focus"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div
          className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto p-2 custom-scrollbar"
          aria-live="polite"
        >
          {query.trim() === "" ? (
            <div className="select-none p-8 text-center text-[10px] uppercase tracking-wider text-text-dark">
              Nhập từ khóa để quét danh mục sản phẩm.
            </div>
          ) : searchError && !isLoading ? (
            <div className="p-8 text-center text-[10px] font-bold uppercase tracking-wider text-status-danger" role="alert">
              Không thể kết nối danh mục sản phẩm. Vui lòng thử lại.
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-[10px] font-bold uppercase tracking-wider text-status-danger">
              Không tìm thấy sản phẩm phù hợp với từ khóa.
            </div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleNavigate(product.slug)}
                className="group flex min-h-16 w-full items-center justify-between border border-transparent p-3 text-left transition-all duration-150 hover:border-primary-neon/20 hover:bg-primary-neon/5 focus-visible:bio-focus"
              >
                <div className="flex min-w-0 max-w-[78%] items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden border border-white/5 bg-black/40">
                    {product.image ? (
                      <img src={product.image} alt="" className="h-full w-full object-cover opacity-75" />
                    ) : (
                      <Search aria-hidden="true" className="m-auto h-full w-4 text-text-dark" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-heading text-[11px] font-bold uppercase text-text-pure transition-colors group-hover:text-primary-neon">
                      {product.name}
                    </span>
                    <span className="truncate text-[9px] uppercase tracking-wide text-text-dark">
                      SKU: {product.sku}
                      {product.scientificName ? ` | ${product.scientificName}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-bold text-primary-cyan">
                    {formatVND(product.price)}
                  </span>
                  <CornerDownLeft
                    className="h-3.5 w-3.5 text-text-dark opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
