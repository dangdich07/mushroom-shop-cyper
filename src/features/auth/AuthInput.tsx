interface AuthInputProps {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}

export function AuthInput({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: AuthInputProps) {
  return (
    <label className="text-[10px] text-text-dark uppercase">
      {label}
      <input
        required
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full bg-background-dark border border-white/10 p-3 text-text-pure focus:border-primary-neon outline-none normal-case"
      />
    </label>
  );
}
