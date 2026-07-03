"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useOverlayStore, SystemToast } from "@/store/useOverlayStore";

export function ToastContainer() {
  const { toasts, dismissToast } = useOverlayStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: SystemToast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`pointer-events-auto w-full p-4 glass-premium border-l-4 flex gap-3 items-start relative overflow-hidden shadow-2xl ${
        toast.type === "SUCCESS" && "border-l-primary-neon shadow-neon-cyan/5"
      } ${
        toast.type === "ERROR" && "border-l-red-500 shadow-red-500/5"
      } ${
        toast.type === "INFO" && "border-l-secondary-purple shadow-neon-purple/5"
      }`}
    >
      {/* Biểu tượng phân định nhóm */}
      <div className="shrink-0 mt-0.5">
        {toast.type === "SUCCESS" && <CheckCircle2 className="w-4 h-4 text-primary-neon" />}
        {toast.type === "ERROR" && <AlertTriangle className="w-4 h-4 text-red-500" />}
        {toast.type === "INFO" && <Info className="w-4 h-4 text-secondary-purple" />}
      </div>

      {/* Cấu trúc nội dung chữ */}
      <div className="flex-grow flex flex-col gap-0.5 pr-4">
        <h4 className="font-heading font-bold text-xs uppercase tracking-wide text-text-pure">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-[11px] font-body text-text-dark leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      {/* Nút đóng cưỡng bức */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3 right-3 text-text-dark hover:text-text-pure transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}