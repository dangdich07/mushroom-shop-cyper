"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, CornerDownLeft } from "lucide-react";
import { MOCK_DATABASE } from "@/services/mockDb";
import { Product } from "@/types/product.types";
import { formatVND } from "@/lib/utils";

export const CommandMenu = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Bộ lắng nghe sự kiện phát sóng (Event Listener) toàn cục và phím tắt hệ thống
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
      setQuery("");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("toggle-cyber-search", handleToggle);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("toggle-cyber-search", handleToggle);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Tự động focus con trỏ chuột vào ô nhập liệu khi Modal xuất hiện
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // LOGIC LỌC ĐA NGUỒN REAL-TIME: Khớp chuỗi theo Tên, SKU và Danh pháp khoa học
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Cơ chế Debounce giảm tải xung hiệu năng máy chủ
    const delayDebounce = setTimeout(() => {
      const filtered = (MOCK_DATABASE?.products || []).filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        (product.scientificName && product.scientificName.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  const handleNavigate = (slug: string) => {
    setIsOpen(false);
    router.push(`/products/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background-deep/80 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-background-dark border border-white/10 shadow-neon-cyan/10 shadow-2xl flex flex-col font-mono text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* KHỐI THANH NHẬP LIỆU TÌM KIẾM CORES */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/20">
          <Search className="w-5 h-5 text-primary-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên nấm, mã định danh SKU hoặc danh pháp khoa học... (Esc để đóng)"
            className="w-full bg-transparent text-text-pure text-sm outline-none placeholder:text-text-dark"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-primary-neon animate-spin shrink-0" />
          ) : query ? (
            <button 
              type="button" 
              onClick={() => setQuery("")}
              className="text-text-dark hover:text-text-pure transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 text-text-dark select-none rounded-none">Ctrl+K</span>
          )}
        </div>

        {/* KHỐI KẾT XUẤT DÒNG DỮ LIỆU SẢN PHẨM KHỚP CHUỖI */}
        <div className="max-h-[50vh] overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-text-dark uppercase text-[10px] tracking-wider select-none">
              Nhập ký tự để quét tìm sinh khối trên toàn mạng lưới...
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-red-400 uppercase text-[10px] tracking-wider font-bold">
              ⚠️ Không tìm thấy bản thể nấm nào khớp với từ khóa định vị vùng biên.
            </div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleNavigate(product.slug)}
                className="w-full p-3 flex items-center justify-between text-left border border-transparent hover:border-primary-neon/20 hover:bg-primary-neon/5 transition-all duration-150 group cursor-pointer"
              >
                <div className="flex items-center gap-3 max-w-[80%]">
                  <div className="w-10 h-10 border border-white/5 bg-black/40 overflow-hidden shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-75" />
                  </div>
                  <div className="flex flex-col gap-0.5 truncate">
                    <span className="font-heading font-bold text-text-pure uppercase text-[11px] group-hover:text-primary-neon transition-colors truncate">
                      {product.name}
                    </span>
                    <span className="text-[9px] text-text-dark uppercase tracking-wide truncate">
                      SKU: {product.sku} {product.scientificName ? `| 🔬 ${product.scientificName}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-primary-cyan">{formatVND(product.price)}</span>
                  <CornerDownLeft className="w-3.5 h-3.5 text-text-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      {/* Vùng biên ngoài nhấp chuột để đóng Modal */}
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  );
};