import { Activity, AlertCircle, ShoppingBag } from "lucide-react";

interface AccountStatePanelProps {
  kind: "LOADING" | "ERROR" | "EMPTY";
  message: string;
}

export function AccountStatePanel({ kind, message }: AccountStatePanelProps) {
  const Icon = kind === "LOADING" ? Activity : kind === "ERROR" ? AlertCircle : ShoppingBag;
  return (
    <div role={kind === "ERROR" ? "alert" : "status"} aria-live={kind === "LOADING" ? "polite" : undefined} className={`flex min-h-40 w-full min-w-0 flex-col items-center justify-center gap-3 border p-6 text-center font-mono text-xs ${kind === "ERROR" ? "border-red-500/20 bg-red-500/5 text-red-400" : "border-dashed border-white/10 bg-black/10 text-text-dark"}`}>
      <Icon aria-hidden="true" className={`h-7 w-7 ${kind === "LOADING" ? "animate-spin text-primary-cyan motion-reduce:animate-none" : ""}`} />
      <p className="max-w-xl break-words uppercase leading-relaxed">{message}</p>
    </div>
  );
}
