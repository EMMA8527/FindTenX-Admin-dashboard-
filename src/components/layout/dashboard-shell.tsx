"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { navItems } from "@/lib/navigation";
import type { AdminRole } from "@/lib/types";

export function DashboardShell({
  children,
  session,
  badges,
}: {
  children: React.ReactNode;
  session: {
    name: string;
    email: string;
    role: AdminRole;
    avatar: string;
  };
  badges: { verification: number; reports: number; support: number };
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30d");

  const current = useMemo(
    () =>
      navItems.find((item) =>
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ),
    [pathname],
  );

  const isOverview = pathname === "/";
  const title = isOverview
    ? `Welcome Back, ${session.role === "super_admin" ? "Super Admin" : session.name.split(" ")[0]} 👋`
    : current?.title ?? "FindTenX Admin";
  const subtitle = isOverview
    ? "Here's what's happening on FindTenX today."
    : "Manage FindTenX operations with role-based controls.";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={session.role}
        name={session.name}
        avatar={session.avatar}
        email={session.email}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        badges={badges}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          name={session.name}
          role={session.role}
          avatar={session.avatar}
          notificationCount={3}
          onMenuClick={() => setMobileOpen(true)}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
