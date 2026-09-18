export interface AccountStatItem {
  label: string;
  value: string;
  tone?: "DEFAULT" | "CYAN" | "NEON" | "PURPLE";
}

interface AccountStatGridProps {
  items: AccountStatItem[];
}

const tones = { DEFAULT: "text-text-pure", CYAN: "text-primary-cyan", NEON: "text-primary-neon", PURPLE: "text-secondary-purple" };

export function AccountStatGrid({ items }: AccountStatGridProps) {
  return (
    <dl className="grid w-full min-w-0 grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => <div key={item.label} className="min-w-0 border border-white/5 bg-background-card/30 p-4"><dt className="break-words text-[9px] uppercase tracking-wider text-text-dark">{item.label}</dt><dd className={`mt-2 break-words text-xl font-black ${tones[item.tone ?? "DEFAULT"]}`}>{item.value}</dd></div>)}
    </dl>
  );
}
