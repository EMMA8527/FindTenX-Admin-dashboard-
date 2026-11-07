"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileTopBar({
  name,
  avatar,
  notificationCount,
  onMenuClick,
}: {
  name: string;
  avatar: string;
  notificationCount: number;
  onMenuClick: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-3 backdrop-blur-xl md:hidden"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom: "0.75rem",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0 rounded-xl bg-card"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
        <BrandLogo showText size="sm" className="min-w-0 [&_p.text-xs]:hidden" />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="relative size-11 rounded-xl bg-card"
                aria-label="Notifications"
              />
            }
          >
            <Bell className="size-5" />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Verification queue needs attention</DropdownMenuItem>
            <DropdownMenuItem>Reports awaiting moderation</DropdownMenuItem>
            <DropdownMenuItem>Open support tickets</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/settings"
          className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Admin profile"
        >
          <Avatar className="size-9">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
