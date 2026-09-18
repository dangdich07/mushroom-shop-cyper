interface AdminPageHeaderProps {
  description: string;
  title: string;
}

export function AdminPageHeader({ description, title }: AdminPageHeaderProps) {
  return <header className="flex min-w-0 flex-col gap-1 border-b border-white/5 pb-5"><h1 className="break-words font-heading text-2xl font-black uppercase tracking-wider text-text-pure">{title}</h1><p className="break-words font-mono text-[10px] uppercase tracking-widest text-text-dark">{description}</p></header>;
}

