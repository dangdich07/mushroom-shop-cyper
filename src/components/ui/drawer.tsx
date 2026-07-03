"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const [isMounted, setIsMounted] = useState(false);

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
        <div className="fixed inset-0 z-[80] overflow-hidden">
          
          {/* Màn mờ phông nền */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background-deep/50 backdrop-blur-sm"
          />

          {/* Thanh trượt Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-background-card/95 backdrop-blur-xl border-l border-white/5 p-6 flex flex-col gap-4 shadow-2xl relative z-10"
          >
            {/* Header Drawer */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-text-pure">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-text-dark hover:text-primary-neon transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Nội dung */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-sm font-body text-text-muted">
              {children}
            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}