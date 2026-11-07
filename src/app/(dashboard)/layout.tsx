import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSession } from "@/lib/auth/session";
import { dashboardBadges } from "@/lib/db/queries";
import { assertDbReady } from "@/lib/db/bootstrap";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  assertDbReady();
  const badges = dashboardBadges();

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
