interface AuthSubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  pending?: boolean;
  pendingLabel: string;
}

export function AuthSubmitButton({ children, disabled = false, pending = false, pendingLabel }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
      className="min-h-12 border border-primary-neon bg-primary-neon px-5 font-mono text-xs font-black uppercase tracking-wider text-background-deep shadow-[var(--shadow-neon-cyan)] transition-[background-color,color,opacity] hover:bg-transparent hover:text-primary-neon focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
