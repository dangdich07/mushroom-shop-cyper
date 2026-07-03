"use client";

import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block w-fit"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[60] bg-background-card/95 backdrop-blur-md border border-primary-neon/30 text-[10px] font-mono text-text-pure uppercase tracking-wide px-2.5 py-1.5 whitespace-nowrap shadow-neon-cyan/20 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-primary-neon/30" />
          {content}
        </div>
      )}
    </div>
  );
}