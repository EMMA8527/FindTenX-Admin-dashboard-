import {
  admins,
  auditLogs,
  conversations,
  discoveryConfig,
  likes,
  matches,
  notifications,
  overviewMetrics,
  plans,
  promotions,
  recentActivity,
  reports,
  settings,
  subscriptions,
  tickets,
  transactions,
  users,
  verifications,
} from "@/lib/data/seed";
import type {
  AccountStatus,
  AuditLog,
  NotificationCampaign,
  PlatformSettings,
  PlatformUser,
  PromoCampaign,
  ReportRecord,
  SupportTicket,
  VerificationSubmission,
  VerificationStatus,
} from "@/lib/types";

const globalStore = globalThis as unknown as {
  __findtenxStore?: ReturnType<typeof createStore>;
};

function createStore() {
  return {
    users: structuredClone(users) as PlatformUser[],
    verifications: structuredClone(verifications) as VerificationSubmission[],
    matches: structuredClone(matches),
    likes: structuredClone(likes),
    conversations: structuredClone(conversations),
    reports: structuredClone(reports) as ReportRecord[],
    plans: structuredClone(plans),
    subscriptions: structuredClone(subscriptions),
    transactions: structuredClone(transactions),
    notifications: structuredClone(notifications) as NotificationCampaign[],
    promotions: structuredClone(promotions) as PromoCampaign[],
    tickets: structuredClone(tickets) as SupportTicket[],
    auditLogs: structuredClone(auditLogs) as AuditLog[],
    admins: structuredClone(admins),
    settings: structuredClone(settings) as PlatformSettings,
    discovery: structuredClone(discoveryConfig),
    activity: structuredClone(recentActivity),
    metrics: structuredClone(overviewMetrics),
  };
}

export function getStore() {
  if (!globalStore.__findtenxStore) {
    globalStore.__findtenxStore = createStore();
  }
  return globalStore.__findtenxStore;
}

export function appendAudit(
  entry: Omit<AuditLog, "id" | "at"> & { at?: string },
) {
  const store = getStore();
  store.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    at: entry.at ?? new Date().toISOString(),
    ...entry,
  });
}

export function updateUserStatus(
  userId: string,
  status: AccountStatus,
  admin: { id: string; name: string; role: AuditLog["adminRole"] },
  reason: string,
) {
  const store = getStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;
  user.accountStatus = status;
  appendAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action: `Account set to ${status}`,
    target: userId,
    result: "success",
    reason,
    ip: "127.0.0.1",
  });
  return user;
}

export function updateVerification(
  id: string,
  status: VerificationStatus,
  admin: { id: string; name: string; role: AuditLog["adminRole"] },
  reason: string,
  notes?: string,
) {
  const store = getStore();
  const item = store.verifications.find((v) => v.id === id);
  if (!item) return null;
  item.status = status;
  if (notes) item.notes = notes;
  const user = store.users.find((u) => u.id === item.userId);
  if (user) user.verificationStatus = status;
  appendAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action: `Verification ${status}`,
    target: id,
    result: "success",
    reason,
    ip: "127.0.0.1",
  });
  return item;
}
