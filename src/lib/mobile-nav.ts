import {
  BadgeCheck,
  Home,
  MoreHorizontal,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export type MobileTab = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  match?: (pathname: string) => boolean;
};

export const mobilePrimaryTabs: MobileTab[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    permission: "overview.view",
    match: (pathname) => pathname === "/",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    permission: "users.view",
    match: (pathname) => pathname.startsWith("/users") || pathname.startsWith("/profiles"),
  },
  {
    title: "Verify",
    href: "/verification",
    icon: BadgeCheck,
    permission: "verification.view",
    match: (pathname) => pathname.startsWith("/verification"),
  },
  {
    title: "Reports",
    href: "/reports",
    icon: Shield,
    permission: "reports.view",
    match: (pathname) => pathname.startsWith("/reports"),
  },
];

export const mobileMoreTab: MobileTab = {
  title: "More",
  href: "#more",
  icon: MoreHorizontal,
  permission: "overview.view",
};
