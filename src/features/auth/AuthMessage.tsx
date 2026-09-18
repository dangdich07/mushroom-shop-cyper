interface AuthMessageProps {
  children: React.ReactNode;
  tone: "error" | "success" | "info";
}

const toneClasses = {
  error: "border-red-500/30 bg-red-500/5 text-red-400",
  success: "border-primary-neon/30 bg-primary-neon/5 text-primary-neon",
  info: "border-primary-cyan/20 bg-primary-cyan/5 text-text-muted",
};

export function AuthMessage({ children, tone }: AuthMessageProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`break-words border p-3 font-mono text-xs leading-relaxed ${toneClasses[tone]}`}
    >
      {children}
    </p>
  );
}

