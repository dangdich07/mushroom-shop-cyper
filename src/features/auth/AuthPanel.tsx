import type { ReactNode } from "react";
import { Key } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";

export function AuthPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <PageWrapper><div className="min-h-[80vh] flex items-center justify-center py-12"><Container className="max-w-md w-full"><div className="glass-premium p-6 sm:p-8 border border-primary-neon/20 flex flex-col gap-6"><div className="text-center flex flex-col items-center gap-1"><div className="w-12 h-12 bg-primary-neon/10 border border-primary-neon/30 text-primary-neon flex items-center justify-center mb-2"><Key className="w-5 h-5" /></div><span className="text-[10px] font-mono text-primary-cyan uppercase tracking-widest">{eyebrow}</span><h1 className="text-xl font-heading font-black text-text-pure uppercase tracking-wide">{title}</h1></div>{children}</div></Container></div></PageWrapper>;
}
