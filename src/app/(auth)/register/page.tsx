"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { registerSchema } from "@/features/auth/authSchemas";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setSuccess(false);
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setMessage("Thông tin đăng ký chưa hợp lệ hoặc mật khẩu xác nhận không khớp.");
      return;
    }

    setPending(true);
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account")}`;
    try {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: callback,
          data: { full_name: parsed.data.fullName },
        },
      });
      if (error) {
        setMessage("Không thể đăng ký tài khoản lúc này.");
        return;
      }

      setSuccess(true);
      setMessage("Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.");
    } catch {
      setMessage("Không thể đăng ký tài khoản lúc này.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel eyebrow="Khởi tạo hồ sơ" title="Đăng ký tài khoản">
      <form onSubmit={submit} className="flex flex-col gap-4 font-mono text-xs">
        <AuthInput label="Họ và tên" type="text" value={form.fullName} onChange={set("fullName")} autoComplete="name" />
        <AuthInput label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
        <AuthInput label="Mật khẩu" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
        <AuthInput label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
        {message && <p className={`border p-3 ${success ? "border-primary-neon/30 text-primary-neon" : "border-red-500/30 text-red-400"}`}>{message}</p>}
        <button disabled={pending || success} className="h-11 bg-primary-neon text-background-deep font-bold uppercase disabled:opacity-50">
          {pending ? "Đang khởi tạo..." : "Đăng ký"}
        </button>
      </form>
      <Link href="/login" className="text-center text-[10px] text-text-dark hover:text-primary-neon">
        Đã có tài khoản? Đăng nhập
      </Link>
    </AuthPanel>
  );
}
