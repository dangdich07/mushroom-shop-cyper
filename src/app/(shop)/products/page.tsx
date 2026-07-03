"use client";

import React, { useState } from "react";
import Link from "next/link"; // Khôi phục lại module Link của Next.js
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, SlidersHorizontal, Search, RotateCcw, ShoppingCart } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { MockDbService } from "@/services/mockDb";
import { MushroomCategory, Product } from "@/types/product.types";
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { formatVND } from "@/lib/utils";

interface ExpectedCartStore {
  addItem: (product: { id: string; name: string; price: number; image: string; sku: string }, quantity: number) => void;
}

export default function ProductsPage() {
  const { addToast } = useOverlayStore();
  const cartStore = useCartStore() as unknown as ExpectedCartStore;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MushroomCategory | "ALL">("ALL");
  const [maxPrice, setMaxPrice] = useState<number>(10000000);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", selectedCategory, searchQuery, maxPrice],
    queryFn: async () => {
      return MockDbService.getProducts({
        category: selectedCategory,
        query: searchQuery,
        maxPrice: maxPrice
      });
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setMaxPrice(10000000);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Ngăn chặn nổi bọt sự kiện nếu có
    e.stopPropagation();

    if (cartStore.addItem) {
      cartStore.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sku: product.sku
      }, 1);

      addToast({
        title: "NẠP SINH KHỐI",
        description: `Đã bơm 1 đơn vị ${product.name} vào khay nghiệm thu giỏ hàng.`,
        type: "SUCCESS"
      });
    }
  };

  return (
    <PageWrapper>
      <div className="relative min-h-screen py-10 border-b border-white/5">
        <Container>
          <div className="flex flex-col gap-2 mb-8 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono text-primary-neon uppercase tracking-widest">Sàn Giao Dịch Vật Phẩm</span>
            <h1 className="text-3xl font-heading font-black uppercase text-text-pure tracking-tight">Hệ Thống Danh Mục Toàn Cầu</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* INVENTORY SIDEBAR FILTER */}
            <aside className="glass-premium p-5 flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 font-heading font-bold text-sm uppercase text-text-pure">
                  <SlidersHorizontal className="w-4 h-4 text-primary-neon" /> Bộ Lọc Thông Số
                </div>
                <button 
                  onClick={resetFilters}
                  className="text-xs font-mono text-text-dark hover:text-primary-neon flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-text-dark uppercase">Tìm Kiếm Sản Phẩm</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập tên nấm, mã SKU..."
                    className="w-full bg-background-dark border border-white/10 text-xs font-mono p-3 text-text-pure placeholder:text-text-dark focus:border-primary-neon focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-text-dark absolute right-3 top-3" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-text-dark uppercase">Chủng Loại Sinh Học</label>
                <div className="flex flex-col gap-1.5">
                  {(["ALL", "MEDICINAL", "FOOD", "EQUIPMENT"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as MushroomCategory | "ALL")}
                      className={`w-full text-left p-2.5 font-mono text-xs border transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? "bg-primary-neon/10 border-primary-neon text-primary-neon font-bold shadow-neon-cyan/20" 
                          : "bg-white/5 border-transparent text-text-dark hover:border-white/10 hover:text-text-pure"
                      }`}
                    >
                      {cat === "ALL" && "● TẤT CẢ DANH MỤC"}
                      {cat === "MEDICINAL" && "▲ NẤM DƯỢC LIỆU"}
                      {cat === "FOOD" && "■ NẤM THỰC PHẨM"}
                      {cat === "EQUIPMENT" && "◆ THIẾT BỊ & PHÔI"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-text-dark uppercase">Ngưỡng Giá Tối Đa</span>
                  <span className="text-primary-neon font-bold">≤ {maxPrice / 1000000}M đ</span>
                </div>
                <input 
                  type="range" 
                  min={100000} 
                  max={10000000} 
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary-neon bg-white/10 h-1 cursor-pointer"
                />
              </div>
            </aside>

            {/* PRODUCT GRID MESH LAYER */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="w-full bg-background-card/50 border border-white/5 p-3 flex items-center justify-between">
                <span className="font-mono text-xs text-text-dark">
                  KẾT QUẢ ĐỐI SOÁT: <span className="text-text-pure font-bold">{products?.length ?? 0}</span> THÀNH PHẦN
                </span>
                <div className="flex items-center gap-1 border border-white/10 p-0.5 bg-black/20">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-primary-neon text-background-deep font-bold" : "text-text-dark hover:text-text-pure"}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-primary-neon text-background-deep font-bold" : "text-text-dark hover:text-text-pure"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className={`glass-card p-4 flex animate-pulse border-dashed border-white/10 ${viewMode === "grid" ? "flex-col gap-4" : "flex-row gap-6"}`}>
                      <div className={`bg-white/5 shrink-0 ${viewMode === "grid" ? "w-full aspect-square" : "w-40 h-40"}`} />
                      <div className="flex-grow flex flex-col gap-3 w-full">
                        <div className="h-3 bg-white/10 w-1/4" />
                        <div className="h-5 bg-white/10 w-3/4" />
                        <div className="h-10 bg-white/5 w-full" />
                        <div className="mt-auto h-8 bg-white/10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                  {products.map((prod) => (
                    <div 
                      key={prod.id} 
                      className={`border border-white/5 bg-background-card/20 flex relative group hover:border-primary-neon/20 transition-all duration-200 ${viewMode === "grid" ? "flex-col" : "flex-row"}`}
                    >
                      {/* Tags nằm ngang và nền trong suốt, viền màu */}
                      {prod.tags && prod.tags.length > 0 && (
                        <div className="absolute top-3 left-3 z-10 flex flex-row flex-wrap gap-1 pointer-events-none">
                          {prod.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 font-mono text-[9px] font-black uppercase bg-transparent border border-primary-cyan text-primary-cyan rounded-full shadow-none">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* KHU VỰC ẢNH (Click được để sang trang chi tiết) */}
                      <Link 
                        href={`/products/${prod.slug}`} 
                        className={`block bg-black/40 border-white/5 overflow-hidden relative shrink-0 cursor-pointer ${viewMode === "grid" ? "w-full h-48 border-b" : "w-48 h-full border-r"}`}
                      >
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" 
                        />
                      </Link>

                      <div className="p-4 flex flex-col gap-3 flex-grow font-mono text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-text-dark uppercase tracking-wide">SKU: {prod.sku}</span>
                          {/* TÊN SẢN PHẨM (Click được để sang trang chi tiết) */}
                          <Link href={`/products/${prod.slug}`}>
                            <h3 className="font-heading font-black text-text-pure text-[12px] uppercase tracking-wide line-clamp-1 hover:text-primary-neon transition-colors cursor-pointer">
                              {prod.name}
                            </h3>
                          </Link>
                          {prod.scientificName && (
                            <span className="text-[10px] text-primary-cyan italic line-clamp-1">🔬 {prod.scientificName}</span>
                          )}
                        </div>

                        <p className={`text-[11px] text-text-dark leading-relaxed ${viewMode === "grid" ? "line-clamp-3" : "line-clamp-4"}`}>
                          {prod.shortDescription}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="font-bold text-sm text-text-pure">{formatVND(prod.price)}</span>
                          
                          {/* NÚT THÊM VÀO GIỎ HÀNG (Hoạt động độc lập không bị dính link) */}
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, prod)}
                            className="h-8 px-3 border border-white/10 flex items-center justify-center text-text-dark hover:text-primary-neon hover:border-primary-neon/30 hover:bg-primary-neon/5 transition-all cursor-pointer gap-2 z-10"
                            title="Nạp hỏa tốc vào giỏ"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {viewMode === "list" && <span className="text-[10px] uppercase font-bold tracking-wider">Thêm vào giỏ</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-20 border border-dashed border-white/10 text-center glass-card">
                  <span className="font-mono text-xs uppercase tracking-widest text-text-dark block mb-2">● THÔNG BÁO HỆ THỐNG ●</span>
                  <p className="font-heading font-bold text-sm text-text-pure uppercase">Không tìm thấy mã gen cấu trúc nấm phù hợp</p>
                </div>
              )}
            </div>

          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}