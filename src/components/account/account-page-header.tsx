interface AccountPageHeaderProps {
  description?: string;
  eyebrow?: string;
  title: string;
}

export function AccountPageHeader({ description, eyebrow, title }: AccountPageHeaderProps) {
  return (
    <header className="min-w-0 border-b border-white/5 pb-4">
      {eyebrow && <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary-cyan">{eyebrow}</p>}
      <h1 className="mt-1 break-words font-heading text-xl font-black uppercase tracking-wide text-text-pure sm:text-2xl">{title}</h1>
      {description && <p className="mt-2 break-words font-mono text-xs leading-relaxed text-text-dark">{description}</p>}
    </header>
  );
}
