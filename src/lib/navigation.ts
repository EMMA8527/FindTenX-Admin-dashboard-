import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  Bell,
  Compass,
  CreditCard,
  Crown,
  Handshake,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  BarChart3,
  Megaphone,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  badgeKey?: "verification" | "reports" | "support";
};

export const navItems: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboard, permission: "overview.view" },
  { title: "User Management", href: "/users", icon: Users, permission: "users.view" },
  { title: "Profile Management", href: "/profiles", icon: UserRound, permission: "profiles.view" },
  {
    title: "Verification Centre",
    href: "/verification",
    icon: BadgeCheck,
    permission: "verification.view",
    badgeKey: "verification",
  },
  { title: "Discovery Management", href: "/discovery", icon: Compass, permission: "discovery.view" },
  { title: "Likes & Matches", href: "/likes-matches", icon: Heart, permission: "likes.view" },
  { title: "Chat Management", href: "/chat", icon: MessageSquare, permission: "chat.view" },
  {
    title: "Reports & Moderation",
    href: "/reports",
    icon: Shield,
    permission: "reports.view",
    badgeKey: "reports",
  },
  {
    title: "Subscription Management",
    href: "/subscriptions",
    icon: Crown,
    permission: "subscriptions.view",
  },
  {
    title: "Payments & Revenue",
    href: "/payments",
    icon: CreditCard,
    permission: "payments.view",
  },
  {
    title: "Notifications Centre",
    href: "/notifications",
    icon: Bell,
    permission: "notifications.view",
  },
  {
    title: "Promotions & Marketing",
    href: "/promotions",
    icon: Megaphone,
    permission: "promotions.view",
  },
  {
    title: "Customer Support",
    href: "/support",
    icon: Ticket,
    permission: "support.view",
    badgeKey: "support",
  },
  {
    title: "Analytics & Reports",
    href: "/analytics",
    icon: BarChart3,
    permission: "analytics.view",
  },
  {
    title: "Admin Staff & Permissions",
    href: "/staff",
    icon: Handshake,
    permission: "staff.view",
  },
  {
    title: "Platform Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings.view",
  },
  {
    title: "Security & Audit Logs",
    href: "/security",
    icon: Activity,
    permission: "security.view",
  },
];

export const sparkles = Sparkles;
