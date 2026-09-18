import type { AccountNotification } from "@/features/account/account.types";
import { Bell } from "lucide-react";

interface AccountNotificationListProps { notifications: AccountNotification[]; }

export function AccountNotificationList({ notifications }: AccountNotificationListProps) {
  if (notifications.length === 0) return <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 border border-dashed border-white/10 bg-black/10 p-6 text-center"><Bell aria-hidden="true" className="h-8 w-8 text-text-dark opacity-30" /><p className="font-mono text-xs uppercase leading-relaxed text-text-dark">Hộp thông báo trống. Chưa có sự kiện mới.</p></div>;
  return <ul className="grid min-w-0 gap-3 font-mono text-xs" aria-label="Danh sách thông báo">{notifications.map((notification) => <li key={notification.id} className="min-w-0 border border-white/5 bg-background-card/20 p-4"><div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><p className="min-w-0 break-words text-[11px] font-bold uppercase tracking-wide text-primary-cyan">{notification.title}</p><time className="shrink-0 self-start border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-text-dark">{notification.time}</time></div><p className="mt-3 break-words border-l border-white/10 pl-3 leading-relaxed text-text-muted">{notification.desc}</p></li>)}</ul>;
}
