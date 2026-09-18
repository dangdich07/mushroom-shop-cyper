interface OrderFlowHeaderProps {
  eyebrow: string;
  title: string;
  orderId?: string;
  description?: string;
}

export function OrderFlowHeader({ description, eyebrow, orderId, title }: OrderFlowHeaderProps) {
  return (
    <header className="min-w-0 border-b border-white/5 pb-5 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary-cyan">{eyebrow}</p>
      <h1 className="mt-2 break-words font-heading text-2xl font-black uppercase tracking-tight text-text-pure sm:text-3xl">{title}</h1>
      {orderId && <p className="mt-2 break-all text-[10px] uppercase tracking-wider text-text-dark">Đơn hàng: <span className="font-bold text-primary-cyan">{orderId}</span></p>}
      {description && <p className="mx-auto mt-3 max-w-xl break-words text-[10px] leading-relaxed text-text-dark">{description}</p>}
    </header>
  );
}
