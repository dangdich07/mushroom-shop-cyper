"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

  return (
    <AuthPanel
      mode="login"
      eyebrow="Hệ thống định danh trung tâm"
      title="Đăng nhập"
      description="Nhập thông tin tài khoản để truy cập hồ sơ, đơn hàng và các tiện ích dành riêng cho thành viên."
    >
      <form onSubmit={submit} aria-busy={pending} className="flex min-w-0 flex-col gap-4 font-mono text-xs">
        <AuthInput name="email" label="Email tài khoản" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="name@example.com" disabled={pending} />
        <AuthInput name="password" label="Mật khẩu" type="password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Tối thiểu 8 ký tự" disabled={pending} />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 font-mono text-[9px] uppercase text-text-muted">
            <input
              type="checkbox"
              checked={rememberEmail}
              disabled={pending}
              onChange={(event) => setRememberEmail(event.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary-neon)] focus-visible:bio-focus"
            />
            Ghi nhớ email
          </label>
          <Link href="/forgot-password" className="inline-flex min-h-10 items-center font-mono text-[9px] uppercase text-primary-cyan hover:text-primary-neon focus-visible:bio-focus">
            Quên mật khẩu?
          </Link>
        </div>
        {message && <AuthMessage tone="error">{message}</AuthMessage>}
        <AuthSubmitButton pending={pending} pendingLabel="Đang xác thực...">Đăng nhập</AuthSubmitButton>
      </form>
      <p className="text-center font-mono text-[9px] uppercase text-text-dark">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="inline-flex min-h-10 items-center font-black text-primary-neon hover:underline focus-visible:bio-focus">Chuyển sang đăng ký</Link>
      </p>
    </AuthPanel>
  );
}
