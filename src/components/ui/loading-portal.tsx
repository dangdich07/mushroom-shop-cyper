"use client";

import React from "react";
import { useOverlayStore } from "@/store/useOverlayStore";

export function LoadingPortal() {
  const { isGlobalLoading } = useOverlayStore();

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background-deep/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Vòng xoay ma trận lượng tử ngoài */}
        <div className="absolute inset-0 border-2 border-primary-neon/20 border-t-primary-neon rounded-full animate-spin shadow-neon-cyan" />
        {/* Vòng xoay ngược chiều tạo hiệu ứng High-tech */}
        <div className="absolute inset-2 border border-secondary-purple/20 border-b-secondary-purple rounded-full animate-spin [animation-direction:reverse] duration-1000" />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-primary-neon mt-4 animate-pulse">
        Đang đồng bộ hóa dữ liệu cốt lõi...
      </span>
    </div>
  );
}