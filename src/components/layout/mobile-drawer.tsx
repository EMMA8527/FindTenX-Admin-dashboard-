"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { can, type Permission } from "@/lib/permissions";
import { navItems } from "@/lib/navigation";
import { formatRole } from "@/lib/roles";
import type { AdminRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MobileDrawer({
  open,
  onOpenChange,
  role,
  name,
  avatar,
  email,
  badges,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AdminRole;
  name: string;
  avatar: string;
  email: string;
  badges: { verification: number; reports: number; support: number };
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        className="absolute inset-0 bg-black/60"
        aria-label="Close menu"
        onClick={() => onOpenChange(false)}
      />
      <aside
        className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl animate-fade-in"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4">
          <BrandLogo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-xl"
            onClick={() => onOpenChange(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        </div>

        <Link
          href="/settings"
          onClick={() => onOpenChange(false)}
          className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-sidebar-accent/50 p-3"
        >
          <Avatar className="size-11 border border-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{formatRole(role)}</p>
            <p className="truncate text-[11px] text-muted-foreground">{email}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1 pb-8">
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
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "nav-active"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" />
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
                  </Link>
                );
              })}
          </nav>
        </ScrollArea>

        <div
          className="border-t border-sidebar-border p-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Button
            variant="outline"
            className="h-11 w-full justify-start gap-2 rounded-xl"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </div>
  );
}
