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
      className="relative min-w-0 overflow-hidden rounded-xl border border-primary-cyan/30 bg-surface-glass p-4 shadow-[0_0_32px_rgba(0,210,230,0.06)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondary-purple/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-primary-neon/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary-neon">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Phần thưởng thành viên
          </span>
          <h2
            id="voucher-wheel-title"
            className="mt-2 font-heading text-xl font-bold text-text-pure"
          >
            Vòng quay may mắn
          </h2>
          <p className="mt-1 max-w-sm text-xs leading-5 text-text-dark">
            Dùng điểm Loyalty để quay voucher. Phần thưởng được lưu vào tài khoản của bạn.
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-primary-neon/20 bg-primary-neon/5 p-2.5 text-primary-neon">
          <Gift className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary-cyan/15 bg-primary-cyan/5 px-3 py-2 text-xs">
        <span className="text-text-dark">Số dư khả dụng</span>
        <span className="flex items-center gap-1.5 font-black text-amber-300">
          <Coins className="h-3.5 w-3.5" aria-hidden="true" />
          {isWalletLoading ? "Đang đồng bộ" : `${pointsBalance} điểm`}
        </span>
      </div>

      <div className="relative mx-auto my-5 flex aspect-square w-full max-w-[280px] items-center justify-center">
        <div className="absolute -top-1 left-1/2 z-30 h-0 w-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-primary-neon drop-shadow-[0_0_10px_#00F5FF]" />

        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="absolute inset-0 rounded-full border-[3px] border-cyan-300/70 bg-[radial-gradient(circle_at_center,#061c30_0_25%,transparent_26%),conic-gradient(from_0deg,#08374a_0deg_60deg,#6324b2_60deg_120deg,#06334c_120deg_180deg,#382084_180deg_240deg,#074c62_240deg_300deg,#7128be_300deg_360deg)] shadow-[0_0_24px_rgba(0,210,230,0.25),inset_0_0_20px_rgba(0,210,230,0.2)]"
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
                  <span className="break-all font-mono text-[9px] font-bold uppercase leading-tight text-cyan-50">
                    {offer.code}
                  </span>
                  <span className="text-[10px] font-semibold text-cyan-100">{offer.label}</span>
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

      <div aria-live="polite" className="min-h-[76px]">
        {selectedOffer ? (
          <div className="rounded-lg border border-primary-neon/25 bg-primary-neon/[0.06] p-3">
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
          <div className="flex min-h-[76px] items-center justify-center rounded-lg border border-red-400/20 bg-red-400/[0.04] px-4 text-center">
            <p className="text-xs leading-5 text-red-300">{errorMessage}</p>
          </div>
        ) : (
          <div className="flex min-h-[76px] items-center justify-center rounded-lg border border-dashed border-primary-cyan/20 px-4 text-center">
            <p className="text-xs leading-5 text-text-dark">
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
