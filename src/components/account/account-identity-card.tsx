interface AccountIdentityCardProps {
  avatarUrl: string;
  displayName: string;
  initials: string;
  position: string;
}

export function AccountIdentityCard({ avatarUrl, displayName, initials, position }: AccountIdentityCardProps) {
  return (
    <section className="glass-premium flex min-w-0 flex-col items-center gap-3 p-5 text-center" aria-label="Thông tin tài khoản">
      <div className="relative h-20 w-20 shrink-0 rounded-full border-2 border-primary-neon p-1">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-background-dark font-mono text-sm font-black text-primary-neon">
          {avatarUrl ? <img src={avatarUrl} alt="Ảnh đại diện tài khoản" className="h-full w-full rounded-full object-cover opacity-80" /> : <span aria-hidden="true">{initials}</span>}
        </div>
        <span aria-hidden="true" className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-4 border-background-deep bg-primary-neon"><span className="h-2 w-2 rounded-full bg-background-deep" /></span>
      </div>
      <div className="flex max-w-full min-w-0 flex-col">
        <h2 className="break-words font-heading text-xs font-bold uppercase tracking-wide text-text-pure">{displayName}</h2>
        <span className="mt-1 break-words font-mono text-[10px] uppercase tracking-widest text-primary-cyan">Hạng: {position}</span>
      </div>
    </section>
  );
}
