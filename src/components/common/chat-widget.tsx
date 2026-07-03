"use client";

import React, { useState } from "react";
import {  X, Bot, Send } from "lucide-react";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Đã nâng tọa độ từ bottom-6 lên bottom-20 để khơi thông không gian đè giao diện
    <div className="fixed bottom-20 right-6 z-50 font-mono text-xs">
      {isOpen ? (
        <div className="w-80 h-96 bg-background-deep border border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-3 bg-primary-neon/10 border-b border-white/10 flex items-center justify-between text-primary-neon">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4 animate-pulse" /> Trợ lý sinh học F1
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="hover:text-text-pure transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto text-text-dark flex flex-col gap-2">
            <div className="bg-white/2 border border-white/5 p-2 rounded max-w-[85%] text-text-muted leading-relaxed">
              Hệ thống ghi nhận phiên kết nối vô trùng. Tôi có thể hỗ trợ gì cho bạn về các chủng loại phôi nấm CyberMush?
            </div>
          </div>
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input type="text" placeholder="Nhập lệnh truy vấn..." className="flex-grow bg-background-dark border border-white/10 p-2 text-text-pure text-xs outline-none focus:border-primary-neon" />
            <button type="button" className="w-8 h-8 bg-primary-neon text-background-deep flex items-center justify-center hover:bg-primary-cyan transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-primary-neon text-background-deep rounded-none flex items-center justify-center hover:bg-primary-cyan transition-all duration-300 shadow-neon-cyan/40 shadow-lg cursor-pointer hover:scale-105"
          title="Mở cổng kết nối robot trợ lý"
        >
          <Bot className="w-5 h-5 animate-bounce" />
        </button>
      )}
    </div>
  );
};