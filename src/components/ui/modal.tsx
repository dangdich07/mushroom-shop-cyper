"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Khóa Hydration để đảm bảo an toàn kết xuất trên Server Component
  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
            className="fixed inset-0 bg-background-deep/60 backdrop-blur-md"
          />

          {/* Khung chứa nội dung hộp thoại */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg glass-premium p-6 relative z-10 shadow-2xl flex flex-col gap-4 border border-primary-neon/20"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-text-pure">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-text-dark hover:text-primary-neon transition-colors p-1 cursor-pointer"
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