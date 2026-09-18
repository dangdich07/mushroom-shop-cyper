"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Terminal, Trash2 } from "lucide-react";
import { AccountNotificationList } from "@/components/account/account-notification-list";
import { AccountSectionToolbar } from "@/components/account/account-section-toolbar";
import { AccountStatePanel } from "@/components/account/account-state-panel";
import { deleteAccountNotifications, getAccountNotifications } from "@/features/account/account.repository";
import { supabase } from "@/lib/supabaseClient";
import { useOverlayStore } from "@/store/useOverlayStore";

export default function AccountNotificationsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useOverlayStore();
  const notificationsQuery = useQuery({ queryKey: ["account-notifications"], queryFn: () => getAccountNotifications(supabase) });
  const clearMutation = useMutation({
    mutationFn: () => deleteAccountNotifications(supabase),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["account-notifications"] });
      addToast({ title: "LOGS CLEANED", description: "Đã dọn sạch toàn bộ thông báo.", type: "SUCCESS" });
    },
    onError: () => addToast({ title: "KHÔNG THỂ XÓA", description: "Thông báo chưa được xóa. Vui lòng thử lại.", type: "ERROR" }),
  });

  if (notificationsQuery.isLoading) return <AccountStatePanel kind="LOADING" message="Đang đồng bộ hóa thông báo..." />;
  if (notificationsQuery.isError) return <div className="space-y-3"><AccountStatePanel kind="ERROR" message="Không thể tải thông báo lúc này." /><button type="button" onClick={() => notificationsQuery.refetch()} className="min-h-11 border border-primary-cyan/30 px-4 font-mono text-xs uppercase text-primary-cyan">Thử lại</button></div>;

  const notifications = notificationsQuery.data ?? [];
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <AccountSectionToolbar icon={<Terminal className="h-4 w-4" />} title="Trung tâm Logs thông báo hệ sinh thái" description="Nhật ký theo dõi biến động dữ liệu" action={notifications.length > 0 ? <button type="button" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending} className="inline-flex min-h-11 items-center gap-2 border border-white/10 px-3 font-mono text-[10px] font-bold uppercase text-text-dark hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"><Trash2 aria-hidden="true" className="h-3 w-3" />{clearMutation.isPending ? "Đang xóa..." : "Xóa sạch thông báo"}</button> : undefined} />
      <AccountNotificationList notifications={notifications} />
    </div>
  );
}
