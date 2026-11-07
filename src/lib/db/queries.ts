import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { assertDbReady } from "@/lib/db/bootstrap";
import * as t from "@/lib/db/schema";
import type { AccountStatus, AdminRole, OverviewMetrics, PlatformUser } from "@/lib/types";

export function mapUser(row: typeof t.users.$inferSelect): PlatformUser {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    age: row.age,
    dateOfBirth: row.dateOfBirth ?? "",
    country: row.country,
    city: row.city,
    gender: row.gender as PlatformUser["gender"],
    avatar: row.avatar,
    bio: row.bio,
    interests: JSON.parse(row.interestsJson || "[]"),
    occupation: row.occupation,
    education: row.education,
    relationshipIntent: row.relationshipIntent,
    photos: JSON.parse(row.photosJson || "[]"),
    registeredAt: row.registeredAt,
    lastActiveAt: row.lastActiveAt,
    verificationStatus: row.verificationStatus as PlatformUser["verificationStatus"],
    membership: row.membership as PlatformUser["membership"],
    subscriptionExpiresAt: row.subscriptionExpiresAt,
    accountStatus: row.accountStatus as PlatformUser["accountStatus"],
    registrationMethod: row.registrationMethod,
    likesSent: row.likesSent,
    likesReceived: row.likesReceived,
    matches: row.matchesCount,
    conversations: row.conversationsCount,
    reportsReceived: row.reportsReceived,
    reportsSubmitted: row.reportsSubmitted,
    profileHidden: row.profileHidden,
    completeness: row.completeness,
  };
}

export function getOverviewFromDb(): OverviewMetrics {
  const db = assertDbReady();
  const snap = db.select().from(t.metricSnapshots).where(eq(t.metricSnapshots.id, "current")).get();
  if (snap) return JSON.parse(snap.json) as OverviewMetrics;

  const totalUsers = db.select({ c: count() }).from(t.users).get()?.c ?? 0;
  const activeUsers =
    db.select({ c: count() }).from(t.users).where(eq(t.users.accountStatus, "active")).get()?.c ?? 0;
  const verifiedUsers =
    db
      .select({ c: count() })
      .from(t.users)
      .where(eq(t.users.verificationStatus, "verified"))
      .get()?.c ?? 0;
  const pendingVerifications =
    db
      .select({ c: count() })
      .from(t.verifications)
      .where(eq(t.verifications.status, "pending"))
      .get()?.c ?? 0;
  const totalMatches = db.select({ c: count() }).from(t.matches).get()?.c ?? 0;
  const totalLikes = db.select({ c: count() }).from(t.likes).get()?.c ?? 0;
  const totalConversations = db.select({ c: count() }).from(t.conversations).get()?.c ?? 0;
  const premiumSubscribers =
    db.select({ c: count() }).from(t.users).where(eq(t.users.membership, "premium")).get()?.c ?? 0;
  const pendingReports =
    db
      .select({ c: count() })
      .from(t.reports)
      .where(
        or(
          eq(t.reports.status, "new"),
          eq(t.reports.status, "under_review"),
          eq(t.reports.status, "escalated"),
          eq(t.reports.status, "action_required"),
        ),
      )
      .get()?.c ?? 0;
  const suspendedAccounts =
    db
      .select({ c: count() })
      .from(t.users)
      .where(eq(t.users.accountStatus, "suspended"))
      .get()?.c ?? 0;

  return {
    totalUsers,
    activeUsers,
    newRegistrations: totalUsers,
    verifiedUsers,
    pendingVerifications,
    totalMatches,
    totalLikes,
    totalConversations,
    premiumSubscribers,
    totalRevenue: 0,
    pendingReports,
    suspendedAccounts,
    changes: {},
  };
}

export function listUsersFromDb(opts: {
  q?: string;
  status?: string;
  verification?: string;
  membership?: string;
  limit?: number;
  offset?: number;
}) {
  const db = assertDbReady();
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;
  const filters = [];
  if (opts.q) {
    const q = `%${opts.q}%`;
    filters.push(
      or(
        like(t.users.fullName, q),
        like(t.users.email, q),
        like(t.users.id, q),
        like(t.users.phone, q),
        like(t.users.country, q),
        like(t.users.city, q),
      )!,
    );
  }
  if (opts.status && opts.status !== "all") {
    filters.push(eq(t.users.accountStatus, opts.status));
  }
  if (opts.verification && opts.verification !== "all") {
    filters.push(eq(t.users.verificationStatus, opts.verification));
  }
  if (opts.membership && opts.membership !== "all") {
    filters.push(eq(t.users.membership, opts.membership));
  }

  const where = filters.length ? and(...filters) : undefined;
  const rows = db
    .select()
    .from(t.users)
    .where(where)
    .orderBy(desc(t.users.registeredAt))
    .limit(limit)
    .offset(offset)
    .all();
  const total = db.select({ c: count() }).from(t.users).where(where).get()?.c ?? 0;
  return { users: rows.map(mapUser), total, limit, offset };
}

export function getUserFromDb(id: string) {
  const db = assertDbReady();
  const row = db.select().from(t.users).where(eq(t.users.id, id)).get();
  return row ? mapUser(row) : null;
}

export function updateUserStatusInDb(
  id: string,
  status: AccountStatus,
  admin: { id: string; name: string; role: AdminRole },
  reason: string,
) {
  const db = assertDbReady();
  const existing = getUserFromDb(id);
  if (!existing) return null;
  db.update(t.users).set({ accountStatus: status }).where(eq(t.users.id, id)).run();
  writeAudit({
    adminId: admin.id,
    adminName: admin.name,
    adminRole: admin.role,
    action: `Account set to ${status}`,
    target: id,
    result: "success",
    reason,
    ip: "127.0.0.1",
  });
  return getUserFromDb(id);
}

export function writeAudit(entry: {
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  target: string;
  result: string;
  reason: string;
  ip: string;
  at?: string;
}) {
  const db = assertDbReady();
  db.insert(t.auditLogs)
    .values({
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      adminId: entry.adminId,
      adminName: entry.adminName,
      adminRole: entry.adminRole,
      action: entry.action,
      target: entry.target,
      result: entry.result,
      reason: entry.reason,
      ip: entry.ip,
      at: entry.at ?? new Date().toISOString(),
    })
    .run();
}

export function findAdminByEmail(email: string) {
  const db = assertDbReady();
  return db
    .select()
    .from(t.admins)
    .where(and(eq(t.admins.email, email.toLowerCase()), eq(t.admins.status, "active")))
    .get() ??
    db
      .select()
      .from(t.admins)
      .where(eq(t.admins.status, "active"))
      .all()
      .find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function touchAdminLogin(adminId: string) {
  const db = assertDbReady();
  db.update(t.admins)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(t.admins.id, adminId))
    .run();
}

export function listTable(name: keyof typeof t, limit = 100) {
  const db = assertDbReady();
  const table = t[name];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db.select().from(table as any).limit(limit).all();
}

export function dashboardBadges() {
  const db = assertDbReady();
  return {
    verification:
      db
        .select({ c: count() })
        .from(t.verifications)
        .where(eq(t.verifications.status, "pending"))
        .get()?.c ?? 0,
    reports:
      db
        .select({ c: count() })
        .from(t.reports)
        .where(
          or(
            eq(t.reports.status, "new"),
            eq(t.reports.status, "under_review"),
            eq(t.reports.status, "escalated"),
            eq(t.reports.status, "action_required"),
          ),
        )
        .get()?.c ?? 0,
    support:
      db
        .select({ c: count() })
        .from(t.supportTickets)
        .where(
          or(
            eq(t.supportTickets.status, "open"),
            eq(t.supportTickets.status, "in_progress"),
            eq(t.supportTickets.status, "waiting_for_user"),
            eq(t.supportTickets.status, "escalated"),
          ),
        )
        .get()?.c ?? 0,
  };
}

export function recentAudit(limit = 20) {
  const db = assertDbReady();
  return db.select().from(t.auditLogs).orderBy(desc(t.auditLogs.at)).limit(limit).all();
}

export function dbHealth() {
  const db = assertDbReady();
  const users = db.select({ c: count() }).from(t.users).get()?.c ?? 0;
  const admins = db.select({ c: count() }).from(t.admins).get()?.c ?? 0;
  return {
    ok: true,
    users,
    admins,
    engine: "sqlite",
    note: process.env.FINDTENX_API_URL
      ? "Local admin DB online; FINDTENX_API_URL set but Core sync not yet authorized for this agent."
      : "Local admin DB online. Core/Data repos not accessible to this agent token.",
  };
}

// silence unused import warning for sql if unused
void sql;
