"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { forgotPasswordSchema } from "@/features/auth/authSchemas";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) return;

    setPending(true);
    setFailed(false);
    try {
      await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel eyebrow="Khôi phục truy cập" title="Quên mật khẩu">
      <form onSubmit={submit} className="flex flex-col gap-4 font-mono text-xs">
        <AuthInput label="Email tài khoản" type="email" value={email} onChange={setEmail} autoComplete="email" />
        {sent && (
          <p className="border border-primary-neon/30 p-3 text-primary-neon">
            Nếu tài khoản tồn tại, hướng dẫn khôi phục đã được gửi.
          </p>
        )}
        {failed && (
          <p className="border border-red-500/30 p-3 text-red-400">
            Không thể kết nối dịch vụ xác thực lúc này.
          </p>
        )}
        <button disabled={pending || sent} className="h-11 bg-primary-neon text-background-deep font-bold uppercase disabled:opacity-50">
          {pending ? "Đang gửi..." : "Gửi hướng dẫn"}
        </button>
      </form>
      <Link href="/login" className="text-center text-[10px] text-text-dark hover:text-primary-neon">
        Quay lại đăng nhập
      </Link>
    </AuthPanel>
  );
}
