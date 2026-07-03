"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 font-mono text-xs mt-10">
      {/* Nút lùi trang */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-9 h-9 border border-white/5 bg-white/2 hover:border-primary-neon/30 hover:text-primary-neon text-text-dark disabled:opacity-20 disabled:hover:text-text-dark transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Vòng lặp số trang ma trận */}
      {Array.from({ length: totalPages }).map((_, idx) => {
        const pageNum = idx + 1;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 border font-bold transition-all cursor-pointer ${
              isActive 
                ? "bg-primary-neon/10 border-primary-neon text-primary-neon shadow-neon-cyan/20" 
                : "bg-white/5 border-transparent text-text-dark hover:border-white/10 hover:text-text-pure"
            }`}
          >
            {String(pageNum).padStart(2, "0")}
          </button>
        );
      })}

      {/* Nút tiến trang */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-9 h-9 border border-white/5 bg-white/2 hover:border-primary-neon/30 hover:text-primary-neon text-text-dark disabled:opacity-20 disabled:hover:text-text-dark transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}