import { AlertTriangle, PackageSearch } from "lucide-react";

interface TrackingStatePanelProps {
  kind: "EMPTY" | "ERROR";
  message: string;
  title: string;
}

export function TrackingStatePanel({ kind, message, title }: TrackingStatePanelProps) {
  const Icon = kind === "ERROR" ? AlertTriangle : PackageSearch;
  return (
    <section role={kind === "ERROR" ? "alert" : "status"} className="flex min-h-[260px] min-w-0 flex-col items-center justify-center gap-3 rounded-xl border border-primary-cyan/25 bg-surface-glass p-6 text-center backdrop-blur-xl sm:p-8">
      <Icon aria-hidden="true" className={`h-8 w-8 ${kind === "ERROR" ? "text-red-400" : "text-text-dark"}`} />
      <h2 className="break-words font-heading text-xl font-semibold text-text-pure">{title}</h2>
      <p className="max-w-lg break-words text-sm leading-relaxed text-text-dark">{message}</p>
    </section>
  );
}
