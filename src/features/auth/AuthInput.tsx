"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";

interface AuthInputProps {
  label: string;
  type: "email" | "password" | "text" | "tel";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  placeholder?: string;
  helpText?: string;
}

export function AuthInput({
  label,
  type,
  value,
  onChange,
  autoComplete,
  disabled = false,
  invalid = false,
  name,
  placeholder,
  helpText,
}: AuthInputProps) {
  const id = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const Icon = type === "email" ? Mail : type === "password" ? LockKeyhole : type === "tel" ? Phone : UserRound;
  const helpId = helpText ? `${id}-help` : undefined;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="font-mono text-[9px] font-bold uppercase tracking-wider text-text-dark">{label}</label>
      <div className="relative mt-1.5 min-w-0">
        <Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark" />
        <input
          id={id}
          name={name}
          required
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helpId}
          type={isPassword && passwordVisible ? "text" : type}
          value={value}
          inputMode={type === "tel" ? "tel" : type === "email" ? "email" : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-12 w-full min-w-0 border bg-background-dark/80 py-3 pl-10 font-mono text-xs text-text-pure outline-none placeholder:text-text-dark/60 focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-60 ${isPassword ? "pr-12" : "pr-3"} ${invalid ? "border-status-danger" : "border-white/10 hover:border-white/20 focus:border-primary-neon"}`}
        />
        {isPassword && (
          <button
            type="button"
            disabled={disabled}
            aria-label={passwordVisible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-dark hover:text-primary-neon focus-visible:bio-focus disabled:opacity-50"
          >
            {passwordVisible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        )}
      </div>
      {helpText && <p id={helpId} className="mt-1.5 font-mono text-[8px] leading-relaxed text-text-dark">{helpText}</p>}
    </div>
  );
}
