"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const apply = () => {
      if (mq.matches) setCollapsed(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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

  function openMore() {
    setMoreOpen(true);
    setMobileOpen(true);
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        role={session.role}
        name={session.name}
        avatar={session.avatar}
        email={session.email}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        badges={badges}
      />

      <MobileDrawer
        open={mobileOpen}
        onOpenChange={(open) => {
          setMobileOpen(open);
          if (!open) setMoreOpen(false);
        }}
        role={session.role}
        name={session.name}
        avatar={session.avatar}
        email={session.email}
        badges={badges}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar
          name={session.name}
          avatar={session.avatar}
          notificationCount={badges.verification + badges.reports + badges.support > 0 ? 3 : 0}
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className="hidden md:block">
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
            showMenuButton={false}
          />
        </div>

        {isOverview ? (
          <div className="border-b border-border/60 px-4 py-3 md:hidden">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 md:px-6 md:py-6 md:pb-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>

        <MobileBottomNav
          role={session.role}
          badges={badges}
          moreOpen={moreOpen || mobileOpen}
          onMoreClick={openMore}
        />
      </div>
    </div>
  );
}
