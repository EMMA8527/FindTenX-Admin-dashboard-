import type { AdminRole } from "@/lib/types";

export type Permission =
  | "overview.view"
  | "users.view"
  | "users.manage"
  | "profiles.view"
  | "profiles.moderate"
  | "verification.view"
  | "verification.manage"
  | "discovery.view"
  | "discovery.manage"
  | "likes.view"
  | "likes.manage"
  | "chat.view"
  | "chat.investigate"
  | "reports.view"
  | "reports.manage"
  | "subscriptions.view"
  | "subscriptions.manage"
  | "payments.view"
  | "payments.manage"
  | "notifications.view"
  | "notifications.manage"
  | "promotions.view"
  | "promotions.manage"
  | "support.view"
  | "support.manage"
  | "analytics.view"
  | "staff.view"
  | "staff.manage"
  | "settings.view"
  | "settings.manage"
  | "security.view"
  | "referrals.view"
  | "referrals.manage"
  | "communications.view"
  | "communications.manage"
  | "fraud.view"
  | "fraud.manage"
  | "content.view"
  | "content.manage"
  | "integrations.view"
  | "integrations.manage";

const allPermissions: Permission[] = [
  "overview.view",
  "users.view",
  "users.manage",
  "profiles.view",
  "profiles.moderate",
  "verification.view",
  "verification.manage",
  "discovery.view",
  "discovery.manage",
  "likes.view",
  "likes.manage",
  "chat.view",
  "chat.investigate",
  "reports.view",
  "reports.manage",
  "subscriptions.view",
  "subscriptions.manage",
  "payments.view",
  "payments.manage",
  "notifications.view",
  "notifications.manage",
  "promotions.view",
  "promotions.manage",
  "support.view",
  "support.manage",
  "analytics.view",
  "staff.view",
  "staff.manage",
  "settings.view",
  "settings.manage",
  "security.view",
  "referrals.view",
  "referrals.manage",
  "communications.view",
  "communications.manage",
  "fraud.view",
  "fraud.manage",
  "content.view",
  "content.manage",
  "integrations.view",
  "integrations.manage",
];

const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: allPermissions,
  operations: [
    "overview.view",
    "users.view",
    "users.manage",
    "profiles.view",
    "profiles.moderate",
    "discovery.view",
    "discovery.manage",
    "likes.view",
    "likes.manage",
    "analytics.view",
    "referrals.view",
    "integrations.view",
  ],
  verification: [
    "overview.view",
    "users.view",
    "verification.view",
    "verification.manage",
  ],
  moderator: [
    "overview.view",
    "users.view",
    "profiles.view",
    "profiles.moderate",
    "reports.view",
    "reports.manage",
    "chat.view",
    "chat.investigate",
    "fraud.view",
  ],
  support: [
    "overview.view",
    "users.view",
    "support.view",
    "support.manage",
    "communications.view",
  ],
  finance: [
    "overview.view",
    "subscriptions.view",
    "payments.view",
    "payments.manage",
    "analytics.view",
    "referrals.view",
  ],
  marketing: [
    "overview.view",
    "notifications.view",
    "notifications.manage",
    "promotions.view",
    "promotions.manage",
    "analytics.view",
    "communications.view",
    "communications.manage",
    "content.view",
    "content.manage",
    "referrals.view",
    "referrals.manage",
  ],
};

export function permissionsFor(role: AdminRole): Permission[] {
  return rolePermissions[role] ?? [];
}

export function can(role: AdminRole, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}
