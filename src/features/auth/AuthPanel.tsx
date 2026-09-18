import type { ReactNode } from "react";
import Link from "next/link";
import { KeyRound, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import styles from "./AuthBackdrop.module.css";

interface AuthPanelProps {
  eyebrow: string;
  title: string;
  description?: string;
  mode?: "login" | "register" | "recovery";
  children: ReactNode;
}

const accessNotes = [
  { icon: ScanFace, label: "Một tài khoản cho mua sắm và theo dõi đơn" },
  { icon: ShieldCheck, label: "Phiên đăng nhập được quản lý bởi Supabase Auth" },
  { icon: Sparkles, label: "Đồng bộ hồ sơ CyberMushroom sau xác thực" },
];

export function AuthPanel({
  eyebrow,
  title,
  description = "Xác thực tài khoản để tiếp tục vào hệ sinh thái CyberMushroom.",
  mode = "recovery",
  children,
}: AuthPanelProps) {
  const showTabs = mode !== "recovery";

  return (
    <PageWrapper>
      <main className="relative isolate flex min-h-[calc(100svh-6rem)] min-w-0 items-center justify-center overflow-hidden py-6 sm:py-10 lg:py-14">
        <div className={styles.scene} aria-hidden="true">
          <div className={styles.stars} />
          <div className={styles.aurora} />
          <div className={styles.portalWrap}>
            <div className={styles.portal} />
            <div className={styles.portalCore} />
            <div className={styles.orbit} />
            <div className={`${styles.orbit} ${styles.orbitReverse}`} />
          </div>
          <div className={styles.horizon} />
          <div className={styles.energyBeam} />
          <div className={styles.floor} />
          <div className={styles.streak} />
          <div className={`${styles.streak} ${styles.streakTwo}`} />
          <div className={`${styles.streak} ${styles.streakThree}`} />
          <div className={`${styles.shard} ${styles.shardOne}`} />
          <div className={`${styles.shard} ${styles.shardTwo}`} />
          <div className={`${styles.shard} ${styles.shardThree}`} />
          <div className={`${styles.shard} ${styles.shardFour}`} />
        </div>
        <Container className="w-full max-w-5xl">
          <section className="glass-premium relative grid min-w-0 overflow-hidden border border-primary-neon/25 bg-background-deep/75 shadow-[var(--shadow-surface-2)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-primary-neon/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-secondary-purple/10 blur-3xl" />

            <aside className="relative hidden min-w-0 flex-col justify-between border-r border-primary-neon/15 bg-background-deep/55 p-8 lg:flex lg:p-10">
              <div>
                <div className="inline-flex min-h-11 items-center gap-3 border border-primary-neon/25 bg-primary-neon/5 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary-neon">
                  <ScanFace aria-hidden="true" className="h-4 w-4" />
                  Access node / F1
                </div>
                <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-primary-cyan">Cổng định danh sinh học</p>
                <h2 className="mt-3 max-w-sm font-heading text-3xl font-black uppercase leading-tight text-text-pure">
                  Kết nối hồ sơ với hệ sinh thái nấm
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-7 text-text-muted">
                  Đăng nhập để quản lý đơn hàng, địa chỉ nhận hàng, danh sách yêu thích và thông tin tài khoản tại một nơi.
                </p>
              </div>

              <ul className="mt-10 grid gap-3" aria-label="Thông tin cổng xác thực">
                {accessNotes.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex min-w-0 items-start gap-3 border-t border-white/5 pt-3 font-mono text-[10px] uppercase leading-relaxed text-text-dark">
                    <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary-cyan" />
                    <span className="break-words">{label}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="relative min-w-0 p-5 sm:p-8 lg:p-10">
              {showTabs && (
                <nav aria-label="Chọn hình thức xác thực" className="mb-8 grid grid-cols-2 border border-white/10 bg-background-dark/70 p-1">
                  <Link
                    href="/login"
                    aria-current={mode === "login" ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center justify-center border-b-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider focus-visible:bio-focus ${mode === "login" ? "border-primary-neon bg-primary-neon/10 text-primary-neon" : "border-transparent text-text-dark hover:text-text-pure"}`}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    aria-current={mode === "register" ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center justify-center border-b-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider focus-visible:bio-focus ${mode === "register" ? "border-status-success bg-status-success/10 text-status-success" : "border-transparent text-text-dark hover:text-text-pure"}`}
                  >
                    Đăng ký
                  </Link>
                </nav>
              )}

              <header className="mb-7 flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary-neon/30 bg-primary-neon/10 text-primary-neon shadow-[var(--shadow-ambient-cyan)]">
                  <KeyRound aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="break-words font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary-cyan">{eyebrow}</span>
                  <h1 className="mt-1 break-words font-heading text-2xl font-black uppercase tracking-wide text-text-pure sm:text-3xl">{title}</h1>
                  <p className="mt-2 max-w-xl text-xs leading-6 text-text-muted">{description}</p>
                </div>
              </header>

              <div className="flex min-w-0 flex-col gap-5">{children}</div>
            </div>
          </section>
        </Container>
      </main>
    </PageWrapper>
  );
}
