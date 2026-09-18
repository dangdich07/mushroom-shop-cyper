"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const shouldReduceMotion = useReducedMotion();

  // Khóa Hydration để đảm bảo an toàn kết xuất trên Server Component
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus());
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

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          
          {/* Màn đen kính mờ nền phía sau */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-background-deep/60 backdrop-blur-md"
          />

          {/* Khung chứa nội dung hộp thoại */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.95,
              y: shouldReduceMotion ? 0 : 10,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.95,
              y: shouldReduceMotion ? 0 : 10,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-lg glass-premium p-6 relative z-10 shadow-2xl flex flex-col gap-4 border border-primary-neon/20 focus:outline-none"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 id={titleId} className="font-heading font-bold text-sm uppercase tracking-widest text-text-pure">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hộp thoại"
                className="min-h-10 min-w-10 text-text-dark hover:text-primary-neon transition-colors cursor-pointer flex items-center justify-center focus-visible:bio-focus"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="text-xs sm:text-sm font-body text-text-muted leading-relaxed">
              {children}
            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
