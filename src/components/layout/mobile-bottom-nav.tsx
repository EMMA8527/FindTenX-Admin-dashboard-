"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { can, type Permission } from "@/lib/permissions";
import { mobileMoreTab, mobilePrimaryTabs } from "@/lib/mobile-nav";
import type { AdminRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MobileBottomNav({
  role,
  badges,
  moreOpen,
  onMoreClick,
}: {
  role: AdminRole;
  badges: { verification: number; reports: number; support: number };
  moreOpen: boolean;
  onMoreClick: () => void;
}) {
  const pathname = usePathname();
  const tabs = mobilePrimaryTabs.filter((tab) => can(role, tab.permission as Permission));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary mobile navigation"
    >
      <ul className="grid grid-cols-5 px-1 pt-1">
        {tabs.map((tab) => {
          const active = tab.match
            ? tab.match(pathname)
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          const badge =
            tab.href === "/verification"
              ? badges.verification
              : tab.href === "/reports"
                ? badges.reports
                : 0;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition",
                  active ? "text-brand-pink" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-xl",
                    active && "bg-brand-pink/15",
                  )}
                >
                  <Icon className={cn("size-5", active && "text-brand-pink")} />
                  {badge > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                {tab.title}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onMoreClick}
            className={cn(
              "relative flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition",
              moreOpen ? "text-brand-pink" : "text-muted-foreground",
            )}
            aria-label="More navigation"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                moreOpen && "bg-brand-pink/15",
              )}
            >
              <mobileMoreTab.icon className="size-5" />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
