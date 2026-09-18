"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => drawerRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] isolate h-[100dvh] overflow-hidden">
          
          {/* Màn mờ phông nền */}
          <div
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-0 bg-background-deep/70 backdrop-blur-sm"
          />

          {/* Thanh trượt Panel */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            style={{
              width: "min(28rem, 100vw)",
              maxWidth: "100vw",
              backgroundColor: "var(--color-surface-raised)",
            }}
            className="fixed inset-y-0 right-0 z-10 flex h-[100dvh] min-h-0 flex-col gap-4 overflow-hidden border-l border-[var(--color-border-default)] p-6 shadow-2xl focus:outline-none"
          >
            {/* Header Drawer */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 id={titleId} className="font-heading font-bold text-sm uppercase tracking-widest text-text-pure">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng bảng điều khiển"
                className="min-h-10 min-w-10 text-text-dark hover:text-primary-neon transition-colors cursor-pointer flex items-center justify-center focus-visible:bio-focus"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Nội dung */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-sm font-body text-text-muted">
              {children}
            </div>
          </div>

        </div>,
    document.body,
  );
}
