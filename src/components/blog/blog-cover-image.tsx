"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface BlogCoverImageProps {
  alt: string;
  className?: string;
  src: string;
}

export function BlogCoverImage({ alt, className = "", src }: BlogCoverImageProps) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => setFailed(!src), [src]);

  if (failed) {
    return (
      <div role="img" aria-label={`Không có ảnh bìa cho ${alt}`} className="flex h-full w-full items-center justify-center bg-background-dark text-text-dark">
        <ImageOff aria-hidden="true" className="h-8 w-8 opacity-50" />
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}

