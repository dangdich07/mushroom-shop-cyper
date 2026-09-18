import type { ReactNode } from "react";

interface AccountSectionToolbarProps {
  action?: ReactNode;
  description?: string;
  icon?: ReactNode;
  title: string;
}

export function AccountSectionToolbar({ action, description, icon, title }: AccountSectionToolbarProps) {
  return (
    <header className="flex min-w-0 flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex min-w-0 items-center gap-2 break-words font-heading text-base font-black uppercase tracking-widest text-text-pure">
          {icon && <span aria-hidden="true" className="shrink-0 text-primary-cyan">{icon}</span>}
          {title}
        </h1>
        {description && <p className="mt-1 break-words font-mono text-[10px] uppercase leading-relaxed text-text-dark">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
