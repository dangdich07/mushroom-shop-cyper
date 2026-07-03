"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Terminal } from "lucide-react";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-deep relative overflow-hidden">
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full cyber-grid" />
      </div>

          <Container className="relative z-10 text-center flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 border-2 border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <ShieldAlert className="w-12 h-12 animate-pulse" />
            </motion.div>

            <div className="flex flex-col gap-2">
              <h1 className="text-6xl md:text-8xl font-heading font-black text-text-pure uppercase tracking-tighter">
                404<span className="text-red-500">_</span>ERROR
              </h1>
              <p className="font-mono text-xs md:text-sm text-primary-neon uppercase tracking-widest">
                Xung đột tọa độ: Bản đồ sinh khối không tồn tại
              </p>
            </div>

            {/* Khối log hệ thống đã được hoạt hóa an toàn bằng mã thực thể HTML &gt; */}
            <div className="max-w-md w-full p-4 bg-white/5 border border-white/10 font-mono text-[10px] text-text-dark text-left leading-relaxed">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                <Terminal className="w-3 h-3" /> <span>SYSTEM_LOG</span>
              </div>
              <p>&gt; Requesting URL path: [REDACTED]</p>
              <p>&gt; Analyzing neural network... 100%</p>
              <p>&gt; Status: Entry Point not found in CyberMushroom Core.</p>
              <p className="text-red-500">&gt; Termination: Access Denied.</p>
            </div>

            <Link 
              href="/" 
              className="mt-4 px-8 py-4 bg-primary-neon text-background-deep font-mono font-bold text-xs uppercase tracking-wider shadow-neon-cyan hover:bg-transparent hover:text-primary-neon border border-primary-neon transition-all"
            >
              Trở về trạm điều phối trung tâm
            </Link>
          </Container>
    </div>
  );
}