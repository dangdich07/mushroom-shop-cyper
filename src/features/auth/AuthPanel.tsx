import type { ReactNode } from "react";
import Link from "next/link";
import { ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { BrandMark } from "@/components/layout/brand-mark";
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
      <main className="relative isolate flex min-h-screen min-w-0 items-center justify-center overflow-hidden bg-background-deep py-3 sm:py-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(1,9,20,0.74)_0%,rgba(1,9,20,0.4)_48%,rgba(1,9,20,0.72)_100%),url('/images/catalog-lingzhi-lab.webp')] bg-cover bg-center" />
        <div className={`${styles.scene} opacity-0`} aria-hidden="true">
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
        <Container className="w-full max-w-[1500px]">
          <section className="relative grid min-w-0 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.62fr)] lg:gap-12">

            <aside className="relative hidden min-w-0 self-stretch flex-col justify-between py-5 pl-7 pr-12 lg:flex">
              <div>
                <div className="inline-flex min-h-11 items-center gap-3 border border-primary-neon/25 bg-primary-neon/5 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary-neon">
                  <ScanFace aria-hidden="true" className="h-4 w-4" />
                  CyberMushroom / F1
                </div>
                <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-primary-cyan">Khoa học kiến tạo sức khỏe</p>
                <h2 className="mt-2 max-w-sm font-heading text-[clamp(2.15rem,3.4vw,3.35rem)] font-black leading-[1.08] text-text-pure">
                  Khoa học<br />kiến tạo<br /><span className="text-primary-neon">sức khỏe</span>
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                  Khai mở tiềm năng của nấm dược liệu bằng khoa học hiện đại, vì một tương lai khỏe mạnh hơn cho mọi người.
                </p>
              </div>

              <ul className="mt-6 grid gap-2" aria-label="Thông tin cổng xác thực">
                {accessNotes.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex min-w-0 items-start gap-3 border-t border-white/5 pt-2 font-mono text-[10px] uppercase leading-relaxed text-text-dark">
                    <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary-cyan" />
                    <span className="break-words">{label}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="relative min-w-0 rounded-2xl border border-primary-cyan/35 bg-[linear-gradient(145deg,rgba(5,29,47,0.92),rgba(3,10,24,0.94))] p-5 shadow-[0_0_48px_rgba(0,210,230,0.16)] backdrop-blur-xl sm:p-6 lg:p-7">
              {showTabs && (
                <nav aria-label="Chọn hình thức xác thực" className="mb-5 grid grid-cols-2 border border-white/10 bg-background-dark/70 p-1">
                  <Link
                    href="/login"
                    aria-current={mode === "login" ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center justify-center border-b-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider focus-visible:bio-focus ${mode === "login" ? "border-primary-neon bg-primary-neon/10 text-primary-neon" : "border-transparent text-text-dark hover:text-text-pure"}`}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    aria-current={mode === "register" ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center justify-center border-b-2 px-3 font-mono text-[10px] font-black uppercase tracking-wider focus-visible:bio-focus ${mode === "register" ? "border-status-success bg-status-success/10 text-status-success" : "border-transparent text-text-dark hover:text-text-pure"}`}
                  >
                    Đăng ký
                  </Link>
                </nav>
              )}

              <header className="mb-4 flex min-w-0 flex-col items-center text-center">
                <BrandMark className="mb-2 scale-90 origin-center" />
                <span className="break-words font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary-cyan">{eyebrow}</span>
                <h1 className="mt-1 break-words font-heading text-2xl font-black tracking-tight text-text-pure sm:text-3xl">{title}</h1>
                <p className="mt-1 max-w-xl text-xs leading-5 text-text-muted">{description}</p>
              </header>

              <div className="flex min-w-0 flex-col gap-3">{children}</div>
            </div>
          </section>
        </Container>
      </main>
    </PageWrapper>
  );
}
