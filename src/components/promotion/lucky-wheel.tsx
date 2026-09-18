"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Coins,
  Gift,
  LogIn,
  RotateCw,
  Sparkles,
} from "lucide-react";

export interface WheelOffer {
  code: string;
  label: string;
}

export interface WheelSpinResult {
  code: string;
  label: string;
  pointsBalance: number;
}

interface LuckyWheelProps {
  offers: WheelOffer[];
  pointsBalance: number;
  spinCost?: number;
  isAuthenticated: boolean;
  isWalletLoading?: boolean;
  onLogin: () => void;
  onSpin: () => Promise<WheelSpinResult>;
  onSelectOffer: (code: string) => void;
}

const SEGMENT_COLORS = [
  "bg-primary-neon",
  "bg-secondary-purple",
  "bg-primary-cyan",
  "bg-violet-500",
  "bg-cyan-300",
  "bg-slate-500",
];

export function LuckyWheel({
  offers,
  pointsBalance,
  spinCost = 50,
  isAuthenticated,
  isWalletLoading = false,
  onLogin,
  onSpin,
  onSelectOffer,
}: LuckyWheelProps) {
  const controls = useAnimation();
  const reduceMotion = useReducedMotion();
  const rotationRef = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<WheelSpinResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wheelOffers = useMemo(() => offers.slice(0, 6), [offers]);
  const segmentCount = Math.max(wheelOffers.length, 1);
  const canAffordSpin = pointsBalance >= spinCost;

  const handleSpin = async () => {
    if (!isAuthenticated) {
      onLogin();
      return;
    }
    if (isSpinning || wheelOffers.length === 0 || !canAffordSpin) return;

    setIsSpinning(true);
    setSelectedOffer(null);
    setErrorMessage(null);

    try {
      const result = await onSpin();
      const selectedIndex = Math.max(
        0,
        wheelOffers.findIndex((offer) => offer.code === result.code),
      );
      const segmentAngle = 360 / segmentCount;
      const alignToPointer =
        360 - selectedIndex * segmentAngle - segmentAngle / 2;
      const nextRotation =
        rotationRef.current + (reduceMotion ? 360 : 1440) + alignToPointer;

      rotationRef.current = nextRotation;
      await controls.start({
        rotate: nextRotation,
        transition: {
          duration: reduceMotion ? 0.35 : 2.8,
          ease: [0.16, 1, 0.3, 1],
        },
      });
      setSelectedOffer(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể hoàn tất lượt quay lúc này.",
      );
    } finally {
      setIsSpinning(false);
    }
  };

  const buttonDisabled =
    isSpinning ||
    isWalletLoading ||
    wheelOffers.length === 0 ||
    (isAuthenticated && !canAffordSpin);

  return (
    <section
      aria-labelledby="voucher-wheel-title"
      className="glass-premium relative overflow-hidden p-5 sm:p-7"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondary-purple/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-primary-neon/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary-neon">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Loyalty reactor
          </span>
          <h2
            id="voucher-wheel-title"
            className="mt-2 font-heading text-xl font-black uppercase text-text-pure"
          >
            Vòng quay tích điểm
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-dark">
            Máy chủ chọn voucher và trừ điểm nguyên tử. Mỗi lượt quay được ghi
            vào lịch sử tài khoản.
          </p>
        </div>
        <div className="border border-primary-neon/20 bg-primary-neon/5 p-2.5 text-primary-neon">
          <Gift className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-y border-white/[0.07] py-3 font-mono text-[10px] uppercase">
        <span className="text-text-dark">Số dư khả dụng</span>
        <span className="flex items-center gap-1.5 font-black text-amber-300">
          <Coins className="h-3.5 w-3.5" aria-hidden="true" />
          {isWalletLoading ? "Đang đồng bộ" : `${pointsBalance} điểm`}
        </span>
      </div>

      <div className="relative mx-auto my-7 flex aspect-square w-full max-w-[310px] items-center justify-center">
        <div className="absolute -top-1 left-1/2 z-30 h-0 w-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-primary-neon drop-shadow-[0_0_10px_#00F5FF]" />

        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="absolute inset-0 rounded-full border-[6px] border-white/[0.06] bg-[radial-gradient(circle_at_center,#0b1120_0_29%,transparent_30%),conic-gradient(from_0deg,rgba(0,245,255,.16),rgba(139,92,246,.14),rgba(0,245,255,.06),rgba(139,92,246,.18),rgba(0,245,255,.12),rgba(139,92,246,.08))] shadow-[0_0_40px_rgba(0,245,255,.08)]"
        >
          <div className="absolute inset-[18%] rounded-full border border-primary-neon/15" />
          {wheelOffers.map((offer, index) => {
            const angle = (360 / segmentCount) * index;
            return (
              <div
                key={offer.code}
                className="absolute inset-0 flex origin-center justify-center pt-5"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="flex max-w-[74px] flex-col items-center gap-1 text-center">
                  <span className="font-mono text-[9px] font-black uppercase leading-tight text-text-pure">
                    {offer.code}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>

        <button
          type="button"
          onClick={handleSpin}
          disabled={buttonDisabled}
          aria-label={
            isAuthenticated
              ? `Quay vòng quay với chi phí ${spinCost} điểm`
              : "Đăng nhập để quay voucher"
          }
          className="relative z-20 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-background-deep bg-primary-neon font-mono text-[10px] font-black uppercase leading-tight text-background-deep shadow-neon-cyan transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-neon focus-visible:ring-offset-4 focus-visible:ring-offset-background-deep disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-text-dark disabled:shadow-none"
        >
          {isSpinning ? (
            <RotateCw className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : !isAuthenticated ? (
            <LogIn className="h-5 w-5" aria-hidden="true" />
          ) : (
            <>
              <span>Quay</span>
              <span>{spinCost} điểm</span>
            </>
          )}
        </button>
      </div>

      <div aria-live="polite" className="min-h-28">
        {selectedOffer ? (
          <div className="border border-primary-neon/25 bg-primary-neon/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-dark">
              Voucher đã vào kho phần thưởng
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-heading text-lg font-black text-primary-neon">
                  {selectedOffer.code}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {selectedOffer.label} · còn {selectedOffer.pointsBalance} điểm
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectOffer(selectedOffer.code)}
                className="inline-flex min-h-10 items-center justify-center gap-2 bg-primary-neon px-4 font-mono text-[10px] font-black uppercase text-background-deep transition-colors hover:bg-text-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-neon"
              >
                Dùng mã
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-28 items-center justify-center border border-red-400/20 bg-red-400/[0.04] px-4 text-center">
            <p className="text-xs leading-5 text-red-300">{errorMessage}</p>
          </div>
        ) : (
          <div className="flex min-h-28 items-center justify-center border border-dashed border-white/10 px-4 text-center">
            <p className="font-mono text-[10px] uppercase leading-5 tracking-wider text-text-dark">
              {!isAuthenticated
                ? "Đăng nhập để truy cập ví điểm và vòng quay"
                : !canAffordSpin
                  ? `Cần thêm ${spinCost - pointsBalance} điểm để quay`
                  : wheelOffers.length > 0
                    ? "Sẵn sàng khóa một voucher ngẫu nhiên"
                    : "Chưa có voucher khả dụng để quay"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
