"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Apple, ArrowRight } from "lucide-react";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthMessage } from "@/features/auth/AuthMessage";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { loginSchema } from "@/features/auth/authSchemas";
import { getSafeInternalRedirect } from "@/features/auth/safeRedirect";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPanel mode="login" eyebrow="Hệ thống định danh trung tâm" title="Đăng nhập"><AuthMessage tone="info">Đang chuẩn bị cổng xác thực...</AuthMessage></AuthPanel>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(() => searchParams.get("error") === "AUTH_CALLBACK_FAILED" ? "Liên kết xác thực không hợp lệ hoặc đã hết hạn." : null);

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem("cybermushroom-login-email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setMessage("Thông tin đăng nhập không hợp lệ.");
      return;
    }

    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        setMessage("Email hoặc mật khẩu không chính xác.");
        return;
      }

      if (rememberEmail) window.localStorage.setItem("cybermushroom-login-email", parsed.data.email);
      else window.localStorage.removeItem("cybermushroom-login-email");

      router.replace(getSafeInternalRedirect(searchParams.get("next")));
      router.refresh();
    } catch {
      setMessage("Email hoặc mật khẩu không chính xác.");
    } finally {
      setPending(false);
    }
  }

  async function signInWithProvider(provider: "google" | "facebook" | "apple") {
    setMessage(null);
    setPending(true);
    try {
      const next = getSafeInternalRedirect(searchParams.get("next"));
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) setMessage(`Chưa thể kết nối với ${provider === "google" ? "Google" : provider === "facebook" ? "Facebook" : "Apple"}. Vui lòng thử lại.`);
    } catch {
      setMessage("Không thể khởi tạo đăng nhập qua nhà cung cấp này.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel
      mode="login"
      eyebrow="Cổng định danh CyberMushroom"
      title="Chào mừng trở lại"
      description="Đăng nhập để tiếp tục hành trình sống khỏe cùng CyberMushroom."
    >
      <form onSubmit={submit} aria-busy={pending} className="flex min-w-0 flex-col gap-3 font-mono text-xs">
        <AuthInput name="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="Nhập email của bạn" disabled={pending} />
        <AuthInput name="password" label="Mật khẩu" type="password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Nhập mật khẩu của bạn" disabled={pending} />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 font-mono text-[9px] uppercase text-text-muted">
            <input
              type="checkbox"
              checked={rememberEmail}
              disabled={pending}
              onChange={(event) => setRememberEmail(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary-neon)] focus-visible:bio-focus"
            />
            Ghi nhớ email
          </label>
          <Link href="/forgot-password" className="inline-flex min-h-8 items-center font-mono text-[9px] uppercase text-primary-cyan hover:text-primary-neon focus-visible:bio-focus">
            Quên mật khẩu?
          </Link>
        </div>
        {message && <AuthMessage tone="error">{message}</AuthMessage>}
        <AuthSubmitButton pending={pending} pendingLabel="Đang xác thực...">Đăng nhập <ArrowRight aria-hidden="true" className="ml-2 inline h-4 w-4" /></AuthSubmitButton>
      </form>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-text-dark before:h-px before:flex-1 before:bg-primary-cyan/20 after:h-px after:flex-1 after:bg-primary-cyan/20">hoặc</div>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" disabled={pending} onClick={() => signInWithProvider("google")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary-cyan/25 bg-background-dark/50 px-2 text-xs font-semibold text-text-pure transition hover:border-primary-cyan hover:bg-primary-cyan/10 focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-50" aria-label="Đăng nhập với Google"><span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-white font-sans text-[11px] font-black leading-none text-[#4285f4]">G</span><span className="hidden sm:inline">Google</span></button>
        <button type="button" disabled={pending} onClick={() => signInWithProvider("facebook")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary-cyan/25 bg-background-dark/50 px-2 text-xs font-semibold text-text-pure transition hover:border-primary-cyan hover:bg-primary-cyan/10 focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-50" aria-label="Đăng nhập với Facebook"><span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-sm bg-[#5b9cff] font-sans text-xs font-black leading-none text-white">f</span><span className="hidden sm:inline">Facebook</span></button>
        <button type="button" disabled={pending} onClick={() => signInWithProvider("apple")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary-cyan/25 bg-background-dark/50 px-2 text-xs font-semibold text-text-pure transition hover:border-primary-cyan hover:bg-primary-cyan/10 focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-50" aria-label="Đăng nhập với Apple"><Apple aria-hidden="true" className="h-4 w-4" /><span className="hidden sm:inline">Apple</span></button>
      </div>
      <Link href="/register" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-primary-neon/70 px-4 font-mono text-xs font-black uppercase tracking-wider text-primary-neon transition hover:bg-primary-neon hover:text-background-deep focus-visible:bio-focus">Tạo tài khoản mới</Link>
      {/* <p className="flex items-center justify-center gap-2 text-center font-mono text-[9px] leading-4 text-text-dark"><ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary-cyan" />Đăng nhập an toàn với mã hóa SSL.</p> */}
    </AuthPanel>
  );
}
