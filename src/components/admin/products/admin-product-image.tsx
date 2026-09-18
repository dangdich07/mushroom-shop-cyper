"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function AdminProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-black/40">{src && !failed ? <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover opacity-80" /> : <ImageOff aria-label="Không có ảnh sản phẩm" className="h-5 w-5 text-text-dark" />}</div>;
}
