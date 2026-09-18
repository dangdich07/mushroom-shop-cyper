"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthMessage } from "@/features/auth/AuthMessage";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { forgotPasswordSchema } from "@/features/auth/authSchemas";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setInvalid(true);
      setFailed(false);
      return;
    }

    setPending(true);
    setFailed(false);
    setInvalid(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel eyebrow="Khôi phục truy cập" title="Quên mật khẩu">
      <form onSubmit={submit} aria-busy={pending} className="flex min-w-0 flex-col gap-4 font-mono text-xs">
        <AuthInput label="Email tài khoản" type="email" value={email} onChange={setEmail} autoComplete="email" disabled={pending || sent} invalid={invalid} />
        {invalid && <AuthMessage tone="error">Email tài khoản chưa hợp lệ.</AuthMessage>}
        {sent && (
          <AuthMessage tone="success">
            Nếu tài khoản tồn tại, hướng dẫn khôi phục đã được gửi.
          </AuthMessage>
        )}
        {failed && (
          <AuthMessage tone="error">
            Không thể kết nối dịch vụ xác thực lúc này.
          </AuthMessage>
        )}
        <AuthSubmitButton pending={pending} disabled={sent} pendingLabel="Đang gửi...">Gửi hướng dẫn</AuthSubmitButton>
      </form>
      <Link href="/login" className="inline-flex min-h-10 items-center justify-center text-center text-[10px] text-text-dark hover:text-primary-neon focus-visible:bio-focus">
        Quay lại đăng nhập
      </Link>
    </AuthPanel>
  );
}
