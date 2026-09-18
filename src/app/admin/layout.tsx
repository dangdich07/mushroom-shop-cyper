import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminIdentity } from "@/lib/adminAuth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let identity;
  try {
    identity = await getAdminIdentity();
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_AUTH_REQUIRED") redirect("/login?next=/admin");
    redirect("/account");
  }

  return <AdminShell identity={identity}>{children}</AdminShell>;
}
