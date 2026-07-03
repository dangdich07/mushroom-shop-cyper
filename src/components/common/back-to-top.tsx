"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          onClick={scrollToTop}
          // SỬA ĐỔI: Thay đổi từ bottom-5 thành bottom-22 để đẩy nút lên trên ChatWidget một cách thanh thoát
          className="fixed bottom-22 right-5 z-[90] w-10 h-10 bg-background-card/80 backdrop-blur-md border border-primary-neon text-primary-neon shadow-neon-cyan flex items-center justify-center hover:bg-primary-neon hover:text-background-deep transition-all duration-300 cursor-pointer group"
          title="Cuộn lên đỉnh tuyến"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          
          {/* Đèn báo hiệu laser góc mỏng */}
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-neon rounded-full shadow-[0_0_5px_#00F5FF]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}