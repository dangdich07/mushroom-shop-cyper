"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthMessage } from "@/features/auth/AuthMessage";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { resetPasswordSchema } from "@/features/auth/authSchemas";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setMessage("Mật khẩu phải có ít nhất 8 ký tự và hai ô phải trùng nhau.");
      return;
    }

    setPending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) {
        setMessage("Không thể cập nhật mật khẩu lúc này.");
        return;
      }
      router.replace("/login");
    } catch {
      setMessage("Không thể cập nhật mật khẩu lúc này.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel eyebrow="Thiết lập khóa mới" title="Đặt lại mật khẩu">
      {!ready ? (
        <AuthMessage tone="info">Đang xác minh phiên khôi phục...</AuthMessage>
      ) : (
        <form onSubmit={submit} aria-busy={pending} className="flex min-w-0 flex-col gap-4 font-mono text-xs">
          <AuthInput label="Mật khẩu mới" type="password" value={password} onChange={setPassword} autoComplete="new-password" disabled={pending} />
          <AuthInput label="Xác nhận mật khẩu" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" disabled={pending} />
          {message && <AuthMessage tone="error">{message}</AuthMessage>}
          <AuthSubmitButton pending={pending} pendingLabel="Đang cập nhật...">Cập nhật mật khẩu</AuthSubmitButton>
        </form>
      )}
    </AuthPanel>
  );
}
