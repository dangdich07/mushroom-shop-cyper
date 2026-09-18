import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/account-shell";
import { getAccountProfile } from "@/features/account/account.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  let profile = null;
  try {
    profile = await getAccountProfile(supabase, user.id);
  } catch {
    // The verified Auth identity remains sufficient to render the protected shell.
  }

  return (
    <AccountShell
      avatarUrl={profile?.avatarUrl ?? ""}
      displayName={profile?.fullName ?? ""}
      email={user.email ?? profile?.email ?? ""}
      position={profile?.labPosition ?? ""}
    >
      {children}
    </AccountShell>
  );
}
