import { Mail } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatePanel } from "@/components/admin/admin-state-panel";
import { supabaseServiceRole } from "@/lib/supabaseServiceRole";

interface NewsletterSubscriber {
  email: string;
  id: string;
  source: string;
  status: string;
  subscribed_at: string;
}

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const { data, error } = await supabaseServiceRole
    .from("newsletter_subscribers")
    .select("id, email, status, source, subscribed_at")
    .order("subscribed_at", { ascending: false })
    .limit(500);
  const subscribers = (data ?? []) as NewsletterSubscriber[];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <AdminPageHeader title="Bản tin" description="Danh sách email đăng ký nhận tin từ Footer" />
      {error ? (
        <AdminStatePanel kind="ERROR" message="Không thể tải danh sách đăng ký. Hãy kiểm tra migration Newsletter." />
      ) : subscribers.length === 0 ? (
        <AdminStatePanel kind="EMPTY" message="Chưa có email nào đăng ký bản tin." />
      ) : (
        <section className="min-w-0 border border-primary-neon/20 bg-background-card/45" aria-labelledby="newsletter-list-title">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
            <h2 id="newsletter-list-title" className="flex items-center gap-2 font-heading text-sm font-black uppercase tracking-wider text-text-pure">
              <Mail aria-hidden="true" className="h-4 w-4 text-primary-neon" /> Email đã đăng ký
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-dark">Tổng: {subscribers.length}</span>
          </header>
          <ul className="divide-y divide-white/5">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id} className="grid min-w-0 gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                <div className="min-w-0">
                  <p className="break-all font-mono text-xs font-bold text-text-pure">{subscriber.email}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-text-dark">
                    Nguồn: {subscriber.source} · {new Date(subscriber.subscribed_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </p>
                </div>
                <span className="w-fit border border-primary-neon/30 px-2 py-1 font-mono text-[9px] font-bold uppercase text-primary-neon">
                  {subscriber.status === "ACTIVE" ? "Đang nhận tin" : "Đã hủy"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
