import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const store = getStore();
  const badges = {
    verification: store.verifications.filter((v) => v.status === "pending").length,
    reports: store.reports.filter((r) =>
      ["new", "under_review", "escalated", "action_required"].includes(r.status),
    ).length,
    support: store.tickets.filter((t) =>
      ["open", "in_progress", "waiting_for_user", "escalated"].includes(t.status),
    ).length,
  };

  return (
    <DashboardShell
      session={{
        name: session.name,
        email: session.email,
        role: session.role,
        avatar: session.avatar,
      }}
      badges={badges}
    >
      {children}
    </DashboardShell>
  );
}
