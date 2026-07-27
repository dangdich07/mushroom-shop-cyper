"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthPanel } from "@/features/auth/AuthPanel";
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
        <p className="text-center text-text-dark">Đang xác minh phiên khôi phục...</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4 font-mono text-xs">
          <AuthInput label="Mật khẩu mới" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
          <AuthInput label="Xác nhận mật khẩu" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          {message && <p className="border border-red-500/30 p-3 text-red-400">{message}</p>}
          <button disabled={pending} className="h-11 bg-primary-neon text-background-deep font-bold uppercase disabled:opacity-50">
            {pending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      )}
    </AuthPanel>
  );
}
