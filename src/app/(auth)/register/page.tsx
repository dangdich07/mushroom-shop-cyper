"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/features/auth/AuthInput";
import { AuthMessage } from "@/features/auth/AuthMessage";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { registerSchema } from "@/features/auth/authSchemas";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", acceptedTerms: false });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const passwordChecks = [
    { label: "Tối thiểu 8 ký tự", valid: form.password.length >= 8 },
    { label: "Hai mật khẩu trùng nhau", valid: Boolean(form.password) && form.password === form.confirmPassword },
  ];

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
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: callback,
          data: { full_name: parsed.data.fullName, phone_number: parsed.data.phone },
        },
      });
      if (error) {
        setMessage("Không thể đăng ký tài khoản lúc này.");
        return;
      }

      if (data.session) {
        router.replace("/account");
        router.refresh();
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
    <AuthPanel
      mode="register"
      eyebrow="Khởi tạo hồ sơ thành viên"
      title="Đăng ký tài khoản"
      description="Tạo hồ sơ CyberMushroom để lưu địa chỉ, quản lý đơn hàng và sử dụng các tiện ích thành viên."
    >
      <form onSubmit={submit} aria-busy={pending} className="flex min-w-0 flex-col gap-4 font-mono text-xs">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <AuthInput name="fullName" label="Họ và tên" type="text" value={form.fullName} onChange={set("fullName")} autoComplete="name" placeholder="Nguyễn Văn A" disabled={pending || success} />
          <AuthInput name="phone" label="Số điện thoại" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="09xxxxxxxx" disabled={pending || success} />
        </div>
        <AuthInput name="email" label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="name@example.com" disabled={pending || success} />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <AuthInput name="password" label="Mật khẩu" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" disabled={pending || success} />
          <AuthInput name="confirmPassword" label="Nhập lại mật khẩu" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" placeholder="Nhập lại mật khẩu" disabled={pending || success} />
        </div>
        <ul className="grid gap-1 border-l border-white/10 pl-3" aria-label="Yêu cầu mật khẩu">
          {passwordChecks.map((check) => (
            <li key={check.label} className={`flex items-center gap-2 font-mono text-[8px] uppercase ${check.valid ? "text-status-success" : "text-text-dark"}`}>
              {check.valid ? <Check aria-hidden="true" className="h-3 w-3" /> : <Circle aria-hidden="true" className="h-2.5 w-2.5" />}
              {check.label}
            </li>
          ))}
        </ul>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 border border-white/10 bg-background-dark/60 p-3 font-mono text-[9px] leading-relaxed text-text-muted">
          <input
            type="checkbox"
            required
            checked={form.acceptedTerms}
            disabled={pending || success}
            onChange={(event) => setForm((current) => ({ ...current, acceptedTerms: event.target.checked }))}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-status-success)] focus-visible:bio-focus"
          />
          <span>Tôi xác nhận thông tin đã nhập là chính xác và đồng ý tạo tài khoản CyberMushroom.</span>
        </label>
        {message && <AuthMessage tone={success ? "success" : "error"}>{message}</AuthMessage>}
        <AuthSubmitButton pending={pending} disabled={success} pendingLabel="Đang khởi tạo...">Đăng ký ngay</AuthSubmitButton>
      </form>
      <p className="text-center font-mono text-[9px] uppercase text-text-dark">
        Đã có tài khoản?{" "}
        <Link href="/login" className="inline-flex min-h-10 items-center font-black text-primary-neon hover:underline focus-visible:bio-focus">Chuyển sang đăng nhập</Link>
      </p>
    </AuthPanel>
  );
}
