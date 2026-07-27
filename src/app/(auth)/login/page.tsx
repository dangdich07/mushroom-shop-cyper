"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { loginSchema } from "@/features/auth/authSchemas";
import { getSafeInternalRedirect } from "@/features/auth/safeRedirect";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

      router.replace(getSafeInternalRedirect(searchParams.get("next")));
      router.refresh();
    } catch {
      setMessage("Email hoặc mật khẩu không chính xác.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel eyebrow="Hệ thống định danh trung tâm" title="Mã hóa danh tính">
      <form onSubmit={submit} className="flex flex-col gap-4 font-mono text-xs">
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <AuthInput label="Mật khẩu" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        {message && <p className="border border-red-500/30 p-3 text-red-400">{message}</p>}
        <button disabled={pending} className="h-11 bg-primary-neon text-background-deep font-bold uppercase disabled:opacity-50">
          {pending ? "Đang xác thực..." : "Xác thực truy cập"}
        </button>
      </form>
      <div className="flex justify-between text-[10px] text-text-dark">
        <Link href="/register" className="hover:text-primary-neon">Đăng ký</Link>
        <Link href="/forgot-password" className="hover:text-primary-neon">Quên mật khẩu?</Link>
      </div>
    </AuthPanel>
  );
}
