"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRole } from "@/lib/roles";
import { can, type Permission } from "@/lib/permissions";
import { navItems } from "@/lib/navigation";
import type { AdminRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  name,
  avatar,
  email,
  collapsed,
  onCollapsedChange,
  badges,
  mobileOpen,
  onMobileOpenChange,
}: {
  role: AdminRole;
  name: string;
  avatar: string;
  email: string;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  badges: { verification: number; reports: number; support: number };
  mobileOpen: boolean;
  onMobileOpenChange: (value: boolean) => void;
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const content = (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[84px]" : "w-[280px]",
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,#ffd700,#ff8c00,#ff1493,#c71585)] opacity-80" />
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4">
        <BrandLogo collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden lg:inline-flex"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems
            .filter((item) => can(role, item.permission as Permission))
            .map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const badge =
                item.badgeKey === "verification"
                  ? badges.verification
                  : item.badgeKey === "reports"
                    ? badges.reports
                    : item.badgeKey === "support"
                      ? badges.support
                      : 0;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onMobileOpenChange(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "nav-active"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2",
                  )}
                  title={item.title}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!collapsed ? (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {badge > 0 ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            active ? "bg-white/20 text-white" : "bg-destructive text-white",
                          )}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </Link>
              );
            })}
        </nav>
      </ScrollArea>

      <div className="relative overflow-hidden border-t border-sidebar-border p-3">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-40 brand-gradient blur-2xl" />
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-2xl bg-sidebar-accent/60 p-3",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="size-9 border border-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{formatRole(role)}</p>
              <p className="truncate text-[11px] text-muted-foreground">{email}</p>
            </div>
          ) : null}
          {!collapsed ? (
            <Button variant="ghost" size="icon-sm" onClick={logout} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">{content}</div>
        </div>
      ) : null}
    </>
  );
}
