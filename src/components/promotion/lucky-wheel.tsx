"use client";

import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import { MOCK_WHEEL_PRIZES } from "@/data/promotions";

export function LuckyWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeMessage, setPrizeMessage] = useState<string | null>(null);
  const controls = useAnimation();

  const handleSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setPrizeMessage(null);

    // Sinh góc quay ngẫu nhiên: Ít nhất 5 vòng (1800 độ) + góc của giải thưởng ngẫu nhiên
    const prizeIndex = Math.floor(Math.random() * MOCK_WHEEL_PRIZES.length);
    const degreesPerSegment = 360 / MOCK_WHEEL_PRIZES.length;
    // Căn giữa góc của phân vùng phần thưởng
    const targetDegrees = 360 - (prizeIndex * degreesPerSegment) - (degreesPerSegment / 2);
    const totalRotation = 1800 + targetDegrees;

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 4, ease: [0.25, 0.1, 0.25, 1] }
    });

    // Thiết lập trạng thái hiển thị phần thưởng
    setPrizeMessage(`Kích hoạt thành công vật phẩm: ${MOCK_WHEEL_PRIZES[prizeIndex].name}`);
    setIsSpinning(false);
  };

  const handleResetWheel = () => {
    controls.set({ rotate: 0 });
    setPrizeMessage(null);
  };

  return (
    <div className="glass-premium p-6 sm:p-8 flex flex-col items-center gap-6 relative w-full overflow-hidden">
      <div className="text-center flex flex-col gap-1">
        <span className="text-[9px] font-mono text-primary-neon uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 animate-spin" /> Vòng Quay Lượng Tử
        </span>
        <h3 className="font-heading font-bold text-lg text-text-pure uppercase tracking-wide">Giải Mã Gen Thưởng</h3>
      </div>

      {/* CẤU TRÚC ĐỒ HỌA VÒNG QUAY */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center">
        {/* Kim chỉ định hướng đỉnh vòng quay */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-primary-neon z-30 drop-shadow-[0_0_8px_#00F5FF]" />

        {/* Khung đĩa xoay phân đoạn */}
        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="w-full h-full rounded-full border-4 border-white/5 relative overflow-hidden grid items-center justify-center bg-background-card"
        >
          {MOCK_WHEEL_PRIZES.map((prize, idx) => {
            const angle = (360 / MOCK_WHEEL_PRIZES.length) * idx;
            return (
              <div
                key={prize.id}
                className="absolute top-0 left-0 w-full h-full origin-center flex items-start justify-center pt-4"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="flex flex-col items-center gap-1 text-center select-none">
                  <span className="font-mono text-[9px] font-bold text-text-pure uppercase tracking-tight max-w-[60px] leading-tight break-words">
                    {prize.name}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${prize.color} border border-white/20`} />
                </div>
              </div>
            );
          })}
          {/* Hệ mạng lưới tia trang trí vòng trong */}
          <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute inset-16 rounded-full border border-primary-neon/10 pointer-events-none" />
        </motion.div>

        {/* Nút bấm kích nổ hạt nhân trung tâm */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute w-14 h-14 rounded-full bg-primary-neon disabled:bg-white/5 text-background-deep disabled:text-text-dark font-mono font-black text-xs uppercase tracking-tighter flex items-center justify-center border-4 border-background-deep shadow-neon-cyan disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed z-20"
        >
          {isSpinning ? "Xoay" : "SPIN"}
        </button>
      </div>

      {/* THÔNG BÁO KẾT QUẢ QUY ĐỔI */}
      <div className="w-full h-12 flex items-center justify-center">
        {prizeMessage ? (
          <div className="text-xs font-mono text-primary-neon bg-primary-neon/5 border border-primary-neon/20 px-4 py-2 flex items-center gap-2 animate-in fade-in duration-200">
            <span>{prizeMessage}</span>
            <button onClick={handleResetWheel} className="text-text-pure underline text-[10px] cursor-pointer pl-2 border-l border-white/10">Làm mới</button>
          </div>
        ) : (
          <p className="text-xs text-text-dark font-body flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Chi phí: 50 điểm tích lũy thành viên / lượt quay.
          </p>
        )}
      </div>
    </div>
  );
}