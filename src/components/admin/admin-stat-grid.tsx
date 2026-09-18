import type { LucideIcon } from "lucide-react";

export interface AdminStatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "CYAN" | "NEON";
}

export function AdminStatGrid({ items }: { items: AdminStatItem[] }) {
  return <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ icon: Icon, label, value, tone }) => <div key={label} className="flex min-w-0 items-center justify-between gap-4 border border-white/5 bg-background-card/20 p-5"><div className="min-w-0"><dt className="break-words font-mono text-[10px] uppercase tracking-wider text-text-dark">{label}</dt><dd className="mt-1 break-words font-mono text-xl font-black tracking-tight text-text-pure">{value}</dd></div><span className={`flex h-10 w-10 shrink-0 items-center justify-center border ${tone === "CYAN" ? "border-primary-cyan/20 bg-primary-cyan/5 text-primary-cyan" : "border-primary-neon/20 bg-primary-neon/5 text-primary-neon"}`}><Icon aria-hidden="true" className="h-4 w-4" /></span></div>)}</dl>;
}

