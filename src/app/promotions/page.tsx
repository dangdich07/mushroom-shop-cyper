"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coins,
  Copy,
  History,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
  WalletCards,
  X,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import {
  LuckyWheel,
  type WheelOffer,
  type WheelSpinResult,
} from "@/components/promotion/lucky-wheel";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import type { Voucher } from "@/types/voucher.types";

type VoucherFilter = "ALL" | "PERCENT" | "FIXED";

interface VoucherRow {
  code: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: string | number;
  min_subtotal: string | number;
  description: string | null;
  expiry_date: string;
}

interface PromotionVoucher extends Voucher {
  daysRemaining: number;
}

interface LoyaltyLedgerRow {
  id: string;
  delta: number;
  balance_after: number;
  reason: "ORDER_DELIVERED" | "PROMOTION_SPIN";
  description: string;
  created_at: string;
}

interface LoyaltySummary {
  points: number;
  lifetimeEarned: number;
  ledger: LoyaltyLedgerRow[];
  rewards: Array<{
    id: string;
    voucher_code: string;
    created_at: string;
  }>;
}

interface SpinRpcResult {
  success: boolean;
  error_code?: string;
  voucher_code?: string;
  discount_type?: "PERCENT" | "FIXED";
  discount_value?: string | number;
  points_balance?: number;
}

const FILTERS: Array<{ value: VoucherFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PERCENT", label: "Theo phần trăm" },
  { value: "FIXED", label: "Giảm trực tiếp" },
];

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysRemaining(expiryDate: string) {
  const today = new Date(`${getLocalDateKey()}T00:00:00`);
  const expiry = new Date(`${expiryDate}T23:59:59`);
  return Math.max(
    0,
    Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000),
  );
}

function formatExpiryDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getVoucherBenefit(voucher: PromotionVoucher) {
  return voucher.discountType === "PERCENT"
    ? `-${voucher.discountValue}%`
    : `-${formatVND(voucher.discountValue)}`;
}

async function fetchActiveVouchers(): Promise<PromotionVoucher[]> {
  const { data, error } = await supabase
    .from("vouchers")
    .select(
      "code, discount_type, discount_value, min_subtotal, description, expiry_date",
    )
    .eq("is_active", true)
    .gte("expiry_date", getLocalDateKey())
    .order("expiry_date", { ascending: true });

  if (error) throw new Error("PROMOTIONS_QUERY_FAILED");

  return ((data ?? []) as VoucherRow[]).map((row) => ({
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minSubtotal: Number(row.min_subtotal),
    description: row.description || "Ưu đãi đang hoạt động trên hệ thống.",
    expiryDate: row.expiry_date,
    daysRemaining: getDaysRemaining(row.expiry_date),
  }));
}

async function fetchCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user?.id ?? null;
}

async function fetchLoyaltySummary(): Promise<LoyaltySummary> {
  const [walletResult, ledgerResult, rewardsResult] = await Promise.all([
    supabase
      .from("loyalty_wallets")
      .select("points, lifetime_earned")
      .maybeSingle(),
    supabase
      .from("loyalty_point_ledger")
      .select("id, delta, balance_after, reason, description, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("user_promotion_rewards")
      .select("id, voucher_code, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  if (walletResult.error || ledgerResult.error || rewardsResult.error) {
    throw new Error("LOYALTY_QUERY_FAILED");
  }

  const wallet = walletResult.data as
    | { points: number; lifetime_earned: number }
    | null;

  return {
    points: wallet?.points ?? 0,
    lifetimeEarned: wallet?.lifetime_earned ?? 0,
    ledger: (ledgerResult.data ?? []) as LoyaltyLedgerRow[],
    rewards: (rewardsResult.data ?? []) as LoyaltySummary["rewards"],
  };
}

export default function PromotionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const { items, appliedVoucher, applyVoucher, removeVoucher } = useCartStore();
  const [filter, setFilter] = useState<VoucherFilter>("ALL");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const {
    data: vouchers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["public-active-vouchers"],
    queryFn: fetchActiveVouchers,
    staleTime: 60_000,
  });

  const { data: currentUserId, isLoading: isSessionLoading } = useQuery({
    queryKey: ["promotion-current-user"],
    queryFn: fetchCurrentUserId,
    staleTime: 60_000,
  });

  const {
    data: loyaltySummary,
    isLoading: isLoyaltyLoading,
    isError: isLoyaltyError,
  } = useQuery({
    queryKey: ["promotion-loyalty-summary", currentUserId],
    queryFn: fetchLoyaltySummary,
    enabled: Boolean(currentUserId),
    staleTime: 15_000,
  });

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const filteredVouchers = useMemo(() => {
    const normalizedSearch = search.trim().toUpperCase();
    return vouchers.filter((voucher) => {
      const matchesFilter =
        filter === "ALL" || voucher.discountType === filter;
      const matchesSearch =
        !normalizedSearch ||
        voucher.code.includes(normalizedSearch) ||
        voucher.description.toUpperCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, vouchers]);

  const expiringSoonCount = vouchers.filter(
    (voucher) => voucher.daysRemaining <= 7,
  ).length;

  const wheelOffers: WheelOffer[] = vouchers.map((voucher) => ({
    code: voucher.code,
    label: getVoucherBenefit(voucher),
  }));

  const handleUseVoucher = (code: string) => {
    const voucher = vouchers.find((item) => item.code === code);
    if (!voucher) return;

    applyVoucher(voucher);
    addToast({
      title: "ĐÃ LƯU MÃ ƯU ĐÃI",
      description: `${voucher.code} đã được gắn vào giỏ hàng. Hệ thống sẽ kiểm tra điều kiện khi thanh toán.`,
      type: "SUCCESS",
    });
    router.push("/cart");
  };

  const handleSpin = async (): Promise<WheelSpinResult> => {
    const idempotencyKey = crypto.randomUUID();
    const { data, error } = await supabase.rpc("spin_promotion_wheel", {
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      throw new Error("Không thể kết nối bộ xử lý vòng quay.");
    }

    const result = data as SpinRpcResult | null;
    if (!result?.success) {
      if (result?.error_code === "INSUFFICIENT_LOYALTY_POINTS") {
        throw new Error("Số dư điểm không đủ cho lượt quay này.");
      }
      if (result?.error_code === "NO_ACTIVE_PROMOTION_PRIZES") {
        throw new Error("Kho voucher hiện chưa có phần thưởng khả dụng.");
      }
      if (result?.error_code === "AUTH_REQUIRED") {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      throw new Error("Lượt quay chưa thể hoàn tất. Vui lòng thử lại.");
    }

    const code = result.voucher_code;
    if (!code) throw new Error("Máy chủ không trả về voucher hợp lệ.");

    const voucher = vouchers.find((item) => item.code === code);
    const discountValue = Number(result.discount_value ?? 0);
    const label =
      voucher
        ? getVoucherBenefit(voucher)
        : result.discount_type === "PERCENT"
          ? `-${discountValue}%`
          : `-${formatVND(discountValue)}`;

    await queryClient.invalidateQueries({
      queryKey: ["promotion-loyalty-summary", currentUserId],
    });

    return {
      code,
      label,
      pointsBalance: Number(result.points_balance ?? 0),
    };
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 1600);
    } catch {
      addToast({
        title: "KHÔNG THỂ SAO CHÉP",
        description: `Bạn có thể nhập thủ công mã ${code} tại giỏ hàng.`,
        type: "INFO",
      });
    }
  };

  return (
    <PageWrapper>
      <main className="relative min-h-screen overflow-hidden py-8 sm:py-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[70vw] -translate-x-1/2 rounded-full bg-primary-neon/[0.04] blur-[120px]" />
        <Container className="relative">
          <header className="border-b border-white/[0.06] pb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-primary-neon">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Trung tâm phân phối ưu đãi
                </span>
                <h1 className="mt-3 font-heading text-3xl font-black uppercase tracking-tight text-text-pure sm:text-5xl">
                  Đặc quyền cho mỗi
                  <span className="block text-primary-neon">hành trình sinh khối</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-text-dark sm:text-base">
                  Khám phá voucher đang hoạt động, kiểm tra điều kiện theo giỏ
                  hàng và áp dụng chỉ trong một chạm.
                </p>
              </div>

              <div className="grid grid-cols-3 border border-white/[0.07] bg-background-card/40">
                <Metric
                  label="Đang mở"
                  value={isLoading ? "—" : String(vouchers.length)}
                />
                <Metric
                  label="Sắp hết hạn"
                  value={isLoading ? "—" : String(expiringSoonCount)}
                  accent={expiringSoonCount > 0}
                />
                <Metric
                  label="Giỏ hàng"
                  value={items.length > 0 ? String(items.length) : "0"}
                />
              </div>
            </div>
          </header>

          {appliedVoucher && (
            <section
              aria-label="Voucher đang được chọn"
              className="mt-6 flex flex-col gap-4 border border-primary-neon/25 bg-primary-neon/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 border border-primary-neon/20 bg-primary-neon/10 p-2 text-primary-neon">
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-dark">
                    Mã đang chờ áp dụng
                  </p>
                  <p className="mt-1 font-heading font-black text-text-pure">
                    {appliedVoucher.code}
                  </p>
                  <p className="mt-0.5 text-xs text-text-dark">
                    Được xác minh lại theo tổng giỏ hàng ở bước thanh toán.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={removeVoucher}
                  className="inline-flex min-h-10 items-center justify-center gap-2 border border-white/10 px-4 font-mono text-[10px] font-bold uppercase text-text-muted transition-colors hover:border-red-400/50 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Gỡ mã
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/cart")}
                  className="inline-flex min-h-10 items-center justify-center gap-2 bg-primary-neon px-4 font-mono text-[10px] font-black uppercase text-background-deep transition-colors hover:bg-text-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-neon"
                >
                  Mở giỏ hàng
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
            <section
              aria-labelledby="voucher-list-title"
              className="xl:col-span-8"
            >
              <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary-neon">
                      Voucher matrix
                    </p>
                    <h2
                      id="voucher-list-title"
                      className="mt-1 font-heading text-xl font-black uppercase text-text-pure"
                    >
                      Kho mã khả dụng
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-text-dark">
                    {filteredVouchers.length} kết quả
                  </span>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <label className="relative flex-1">
                    <span className="sr-only">Tìm voucher</span>
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark"
                      aria-hidden="true"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Tìm theo mã hoặc quyền lợi..."
                      className="min-h-11 w-full border border-white/10 bg-background-card/50 pl-10 pr-4 font-mono text-xs text-text-pure outline-none transition-colors placeholder:text-text-dark focus:border-primary-neon"
                    />
                  </label>
                  <div
                    className="flex gap-1 overflow-x-auto"
                    aria-label="Lọc voucher"
                  >
                    {FILTERS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFilter(item.value)}
                        aria-pressed={filter === item.value}
                        className={`min-h-11 shrink-0 border px-3 font-mono text-[10px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-neon ${
                          filter === item.value
                            ? "border-primary-neon bg-primary-neon/10 text-primary-neon"
                            : "border-white/10 text-text-dark hover:border-white/20 hover:text-text-pure"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <VoucherSkeleton key={index} />
                  ))}

                {isError && (
                  <div className="col-span-full border border-red-400/20 bg-red-400/[0.05] p-7 text-center">
                    <p className="font-heading font-bold uppercase text-red-300">
                      Không thể đồng bộ kho ưu đãi
                    </p>
                    <p className="mt-2 text-sm text-text-dark">
                      Kiểm tra kết nối và thử lại sau ít phút.
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-5 min-h-10 border border-red-300/40 px-4 font-mono text-[10px] font-bold uppercase text-red-200 hover:bg-red-300/10"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {!isLoading &&
                  !isError &&
                  filteredVouchers.map((voucher) => (
                    <VoucherCard
                      key={voucher.code}
                      voucher={voucher}
                      subtotal={subtotal}
                      isApplied={appliedVoucher?.code === voucher.code}
                      copied={copiedCode === voucher.code}
                      onCopy={() => handleCopyCode(voucher.code)}
                      onUse={() => handleUseVoucher(voucher.code)}
                    />
                  ))}

                {!isLoading &&
                  !isError &&
                  filteredVouchers.length === 0 && (
                    <div className="col-span-full flex min-h-64 flex-col items-center justify-center border border-dashed border-white/10 px-6 text-center">
                      <Tag
                        className="h-8 w-8 text-text-dark"
                        aria-hidden="true"
                      />
                      <p className="mt-4 font-heading font-bold uppercase text-text-pure">
                        Không tìm thấy mã phù hợp
                      </p>
                      <p className="mt-2 text-sm text-text-dark">
                        Thử từ khóa khác hoặc chuyển về bộ lọc tất cả.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilter("ALL");
                        }}
                        className="mt-4 font-mono text-[10px] font-bold uppercase text-primary-neon"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  )}
              </div>
            </section>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:col-span-4">
              <LuckyWheel
                offers={wheelOffers}
                pointsBalance={loyaltySummary?.points ?? 0}
                isAuthenticated={Boolean(currentUserId)}
                isWalletLoading={isSessionLoading || isLoyaltyLoading}
                onLogin={() =>
                  router.push(
                    `/login?next=${encodeURIComponent("/promotions")}`,
                  )
                }
                onSpin={handleSpin}
                onSelectOffer={handleUseVoucher}
              />

              <section className="border border-white/[0.07] bg-background-card/35 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-secondary-purple"
                    aria-hidden="true"
                  />
                  <h2 className="font-heading text-sm font-black uppercase text-text-pure">
                    Quy trình kích hoạt
                  </h2>
                </div>
                <ol className="mt-5 space-y-4">
                  <ProtocolStep
                    number="01"
                    title="Chọn voucher"
                    description="Lưu mã phù hợp vào giỏ hàng."
                  />
                  <ProtocolStep
                    number="02"
                    title="Đạt ngưỡng đơn"
                    description="Hệ thống tự kiểm tra tổng giá trị."
                  />
                  <ProtocolStep
                    number="03"
                    title="Xác nhận checkout"
                    description="Database tính lại ưu đãi an toàn."
                    isLast
                  />
                </ol>
              </section>
            </aside>
          </div>

          <LoyaltyDashboard
            isAuthenticated={Boolean(currentUserId)}
            isLoading={isSessionLoading || isLoyaltyLoading}
            isError={isLoyaltyError}
            summary={loyaltySummary}
            activeVoucherCodes={vouchers.map((voucher) => voucher.code)}
            onUseVoucher={handleUseVoucher}
            onLogin={() =>
              router.push(`/login?next=${encodeURIComponent("/promotions")}`)
            }
          />
        </Container>
      </main>
    </PageWrapper>
  );
}

function LoyaltyDashboard({
  isAuthenticated,
  isLoading,
  isError,
  summary,
  activeVoucherCodes,
  onUseVoucher,
  onLogin,
}: {
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  summary?: LoyaltySummary;
  activeVoucherCodes: string[];
  onUseVoucher: (code: string) => void;
  onLogin: () => void;
}) {
  return (
    <section
      aria-labelledby="loyalty-dashboard-title"
      className="mt-10 border border-white/[0.07] bg-background-card/35"
    >
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-secondary-purple">
            <Coins className="h-3.5 w-3.5" aria-hidden="true" />
            Loyalty ledger
          </span>
          <h2
            id="loyalty-dashboard-title"
            className="mt-2 font-heading text-xl font-black uppercase text-text-pure"
          >
            Ví điểm thành viên
          </h2>
        </div>
        <p className="max-w-md text-xs leading-5 text-text-dark">
          Nhận 1 điểm cho mỗi 10.000 ₫ của đơn đã giao. Database chỉ cộng một
          lần và lưu mọi biến động vào sổ giao dịch.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <p className="font-heading font-bold uppercase text-text-pure">
            Đăng nhập để mở ví điểm
          </p>
          <p className="mt-2 max-w-md text-sm text-text-dark">
            Điểm thưởng, lượt quay và lịch sử được bảo vệ theo tài khoản của
            bạn.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-5 min-h-11 bg-secondary-purple px-5 font-mono text-[10px] font-black uppercase text-white transition-colors hover:bg-secondary-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-purple"
          >
            Đăng nhập ngay
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid animate-pulse gap-px bg-white/[0.06] md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 bg-background-deep/90 p-5">
              <div className="h-3 w-24 bg-white/[0.06]" />
              <div className="mt-4 h-8 w-32 bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="px-6 py-10 text-center">
          <p className="font-heading font-bold uppercase text-amber-300">
            Ví điểm chưa được kích hoạt
          </p>
          <p className="mt-2 text-sm text-text-dark">
            Migration Loyalty cần được chạy trên Supabase test project trước.
          </p>
        </div>
      ) : (
        <div className="grid gap-px bg-white/[0.06] lg:grid-cols-[0.8fr_0.8fr_1.8fr]">
          <LoyaltyMetric
            label="Điểm khả dụng"
            value={`${summary?.points ?? 0}`}
            note="50 điểm / lượt quay"
            accent="cyan"
          />
          <LoyaltyMetric
            label="Tổng điểm đã nhận"
            value={`${summary?.lifetimeEarned ?? 0}`}
            note="Từ đơn giao thành công"
            accent="purple"
          />
          <div className="bg-background-deep/90 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-text-pure">
                <History className="h-3.5 w-3.5 text-text-dark" aria-hidden="true" />
                Biến động gần đây
              </p>
              <span className="font-mono text-[9px] uppercase text-text-dark">
                {summary?.ledger.length ?? 0} bản ghi
              </span>
            </div>
            {summary?.ledger.length ? (
              <ul className="mt-4 divide-y divide-white/[0.06]">
                {summary.ledger.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-xs font-medium text-text-muted">
                        {entry.description}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase text-text-dark">
                        {new Intl.DateTimeFormat("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(entry.created_at))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-mono text-xs font-black ${
                          entry.delta > 0
                            ? "text-primary-neon"
                            : "text-amber-300"
                        }`}
                      >
                        {entry.delta > 0 ? "+" : ""}
                        {entry.delta}
                      </p>
                      <p className="mt-1 font-mono text-[9px] text-text-dark">
                        Còn {entry.balance_after}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 border border-dashed border-white/10 p-5 text-center text-xs text-text-dark">
                Lịch sử sẽ xuất hiện khi đơn đầu tiên được giao hoặc bạn thực
                hiện lượt quay.
              </p>
            )}

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-text-pure">
                  <Ticket className="h-3.5 w-3.5 text-primary-neon" aria-hidden="true" />
                  Kho phần thưởng
                </p>
                <span className="font-mono text-[9px] uppercase text-text-dark">
                  {summary?.rewards.length ?? 0} voucher
                </span>
              </div>
              {summary?.rewards.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.rewards.map((reward) => {
                    const isActive = activeVoucherCodes.includes(
                      reward.voucher_code,
                    );
                    return (
                      <button
                        key={reward.id}
                        type="button"
                        disabled={!isActive}
                        onClick={() => onUseVoucher(reward.voucher_code)}
                        className="border border-primary-neon/20 bg-primary-neon/[0.05] px-3 py-2 font-mono text-[9px] font-black uppercase text-primary-neon transition-colors hover:bg-primary-neon/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-text-dark"
                        title={
                          isActive
                            ? "Dùng voucher này"
                            : "Voucher đã hết hiệu lực"
                        }
                      >
                        {reward.voucher_code}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-xs text-text-dark">
                  Voucher nhận từ vòng quay sẽ được lưu tại đây.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function LoyaltyMetric({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: "cyan" | "purple";
}) {
  return (
    <div className="bg-background-deep/90 p-5 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-dark">
        {label}
      </p>
      <p
        className={`mt-3 font-heading text-4xl font-black ${
          accent === "cyan" ? "text-primary-neon" : "text-secondary-purple"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-text-dark">{note}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-24 border-r border-white/[0.07] px-4 py-3 last:border-r-0 sm:min-w-28">
      <p className="font-mono text-[9px] uppercase tracking-wider text-text-dark">
        {label}
      </p>
      <p
        className={`mt-1 font-heading text-xl font-black ${
          accent ? "text-amber-300" : "text-text-pure"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function VoucherCard({
  voucher,
  subtotal,
  isApplied,
  copied,
  onCopy,
  onUse,
}: {
  voucher: PromotionVoucher;
  subtotal: number;
  isApplied: boolean;
  copied: boolean;
  onCopy: () => void;
  onUse: () => void;
}) {
  const remaining = Math.max(0, voucher.minSubtotal - subtotal);
  const eligible = remaining === 0;
  const progress =
    voucher.minSubtotal === 0
      ? 100
      : Math.min(100, Math.round((subtotal / voucher.minSubtotal) * 100));

  return (
    <article
      className={`group relative overflow-hidden border bg-background-card/45 p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        isApplied
          ? "border-primary-neon/50 shadow-[0_0_24px_rgba(0,245,255,.08)]"
          : "border-white/[0.07] hover:border-primary-neon/25"
      }`}
    >
      <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-white/[0.07] bg-background-deep" />
      <div className="flex items-start justify-between gap-4 pr-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-primary-neon/25 bg-primary-neon/[0.06] px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-primary-neon">
              {voucher.code}
            </span>
            {voucher.daysRemaining <= 7 && (
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase text-amber-300">
                <Clock3 className="h-3 w-3" aria-hidden="true" />
                Còn {voucher.daysRemaining} ngày
              </span>
            )}
          </div>
          <p className="mt-4 font-heading text-3xl font-black tracking-tight text-text-pure">
            {getVoucherBenefit(voucher)}
          </p>
          <p className="mt-2 min-h-10 text-sm leading-5 text-text-dark">
            {voucher.description}
          </p>
        </div>
        <div className="border border-white/10 bg-white/[0.03] p-2 text-text-dark transition-colors group-hover:text-primary-neon">
          {voucher.discountType === "PERCENT" ? (
            <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
          ) : (
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-wide">
          <span className="text-text-dark">
            Đơn tối thiểu {formatVND(voucher.minSubtotal)}
          </span>
          <span className={eligible ? "text-primary-neon" : "text-text-muted"}>
            {eligible ? "Đủ điều kiện" : `Thiếu ${formatVND(remaining)}`}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-secondary-purple to-primary-neon transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase text-text-dark">
          <span>Hạn {formatExpiryDate(voucher.expiryDate)}</span>
          <span>{progress}% ngưỡng đơn</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Sao chép mã ${voucher.code}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/10 text-text-dark transition-colors hover:border-primary-neon/30 hover:text-primary-neon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-neon"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={onUse}
          className={`inline-flex min-h-11 items-center justify-center gap-2 px-4 font-mono text-[10px] font-black uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-neon ${
            isApplied
              ? "border border-primary-neon/40 bg-primary-neon/10 text-primary-neon"
              : "bg-primary-neon text-background-deep hover:bg-text-pure"
          }`}
        >
          {isApplied ? "Đang dùng" : "Lưu vào giỏ"}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function VoucherSkeleton() {
  return (
    <div className="h-[340px] animate-pulse border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="h-6 w-28 bg-white/[0.06]" />
      <div className="mt-5 h-9 w-36 bg-white/[0.06]" />
      <div className="mt-4 h-4 w-full bg-white/[0.04]" />
      <div className="mt-2 h-4 w-3/4 bg-white/[0.04]" />
      <div className="mt-8 h-px w-full bg-white/[0.06]" />
      <div className="mt-7 h-11 w-full bg-white/[0.05]" />
    </div>
  );
}

function ProtocolStep({
  number,
  title,
  description,
  isLast = false,
}: {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {!isLast && (
        <span className="absolute left-[15px] top-8 h-[calc(100%+8px)] w-px bg-white/[0.08]" />
      )}
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border border-secondary-purple/30 bg-secondary-purple/10 font-mono text-[9px] font-black text-secondary-purple">
        {number}
      </span>
      <div>
        <p className="font-mono text-[10px] font-bold uppercase text-text-pure">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-text-dark">{description}</p>
      </div>
    </li>
  );
}
