import { getDb, getSqlite } from "@/lib/db/client";
import { migrateAdminDb } from "@/lib/db/migrate";
import * as tables from "@/lib/db/schema";
import {
  admins as seedAdmins,
  auditLogs as seedAudit,
  conversations as seedConversations,
  likes as seedLikes,
  matches as seedMatches,
  reports as seedReports,
  settings,
  subscriptions as seedSubs,
  tickets as seedTickets,
  transactions as seedTx,
  users as seedUsers,
  verifications as seedVerifications,
} from "@/lib/data/seed";

/**
 * Ensures schema exists.
 *
 * Platform seed import is ONLY allowed when PLATFORM_DATA_MODE=local_dev.
 * Local SQLite is never a substitute for FindTenX Core production data.
 */
export function ensureAdminDatabase() {
  migrateAdminDb();
  const sqlite = getSqlite();
  const bootstrapped = sqlite
    .prepare("SELECT value FROM schema_meta WHERE key = ?")
    .get("bootstrapped_at") as { value: string } | undefined;

  if (bootstrapped) return { bootstrapped: false as const };

  const allowBootstrap = (process.env.PLATFORM_DATA_MODE || "").trim().toLowerCase() === "local_dev";
  if (!allowBootstrap) {
    const now = new Date().toISOString();
    sqlite
      .prepare(
        "INSERT INTO schema_meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      )
      .run("bootstrapped_at", now);
    sqlite
      .prepare(
        "INSERT INTO schema_meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      )
      .run("data_source", "core_required_no_local_bootstrap");
    return { bootstrapped: false as const, skippedSeed: true as const };
  }

  const db = getDb();
  const now = new Date().toISOString();

  sqlite.transaction(() => {
    db.insert(tables.admins)
      .values(
        seedAdmins.map((a) => ({
          id: a.id,
          email: a.email,
          name: a.name,
          role: a.role,
          avatar: a.avatar,
          mfaEnabled: a.mfaEnabled,
          status: a.status,
          lastLoginAt: a.lastLoginAt,
          createdAt: a.createdAt,
        })),
      )
      .run();

    db.insert(tables.users)
      .values(
        seedUsers.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          age: u.age,
          dateOfBirth: u.dateOfBirth,
          country: u.country,
          city: u.city,
          gender: u.gender,
          avatar: u.avatar,
          bio: u.bio,
          interestsJson: JSON.stringify(u.interests),
          occupation: u.occupation,
          education: u.education,
          relationshipIntent: u.relationshipIntent,
          photosJson: JSON.stringify(u.photos),
          registeredAt: u.registeredAt,
          lastActiveAt: u.lastActiveAt,
          verificationStatus: u.verificationStatus,
          membership: u.membership,
          subscriptionExpiresAt: u.subscriptionExpiresAt,
          accountStatus: u.accountStatus,
          registrationMethod: u.registrationMethod,
          likesSent: u.likesSent,
          likesReceived: u.likesReceived,
          matchesCount: u.matches,
          conversationsCount: u.conversations,
          reportsReceived: u.reportsReceived,
          reportsSubmitted: u.reportsSubmitted,
          profileHidden: u.profileHidden,
          completeness: u.completeness,
        })),
      )
      .run();

    if (seedVerifications.length) {
      db.insert(tables.verifications)
        .values(
          seedVerifications.map((v) => ({
            id: v.id,
            userId: v.userId,
            userName: v.userName,
            userAvatar: v.userAvatar,
            type: v.type,
            submittedAt: v.submittedAt,
            status: v.status,
            priority: v.priority,
            providerResult: v.providerResult,
            notes: v.notes,
          })),
        )
        .run();
    }

    if (seedMatches.length) {
      db.insert(tables.matches)
        .values(
          seedMatches.map((m) => ({
            id: m.id,
            userAId: m.userAId,
            userAName: m.userAName,
            userAAvatar: m.userAAvatar,
            userBId: m.userBId,
            userBName: m.userBName,
            userBAvatar: m.userBAvatar,
            matchedAt: m.matchedAt,
            status: m.status,
          })),
        )
        .run();
    }

    if (seedLikes.length) {
      db.insert(tables.likes)
        .values(
          seedLikes.map((l) => ({
            id: l.id,
            fromUserId: l.fromUserId,
            fromUserName: l.fromUserName,
            toUserId: l.toUserId,
            toUserName: l.toUserName,
            createdAt: l.createdAt,
            membership: l.membership,
            country: l.country,
          })),
        )
        .run();
    }

    if (seedConversations.length) {
      db.insert(tables.conversations)
        .values(
          seedConversations.map((c) => ({
            id: c.id,
            participantsJson: JSON.stringify(c.participants),
            participantNamesJson: JSON.stringify(c.participantNames),
            messageCount: c.messageCount,
            lastMessageAt: c.lastMessageAt,
            reported: c.reported,
            deliveryErrors: c.deliveryErrors,
            status: c.status,
          })),
        )
        .run();
    }

    if (seedReports.length) {
      db.insert(tables.reports)
        .values(
          seedReports.map((r) => ({
            id: r.id,
            reporterId: r.reporterId,
            reporterName: r.reporterName,
            reportedId: r.reportedId,
            reportedName: r.reportedName,
            category: r.category,
            explanation: r.explanation,
            submittedAt: r.submittedAt,
            priority: r.priority,
            assignedModerator: r.assignedModerator,
            status: r.status,
            notes: r.notes,
          })),
        )
        .run();
    }

    if (seedSubs.length) {
      db.insert(tables.subscriptions)
        .values(
          seedSubs.map((s) => ({
            id: s.id,
            userId: s.userId,
            userName: s.userName,
            planId: s.planId,
            planName: s.planName,
            status: s.status,
            startedAt: s.startedAt,
            renewsAt: s.renewsAt,
            provider: s.provider,
          })),
        )
        .run();
    }

    if (seedTx.length) {
      db.insert(tables.transactions)
        .values(
          seedTx.map((t) => ({
            id: t.id,
            userId: t.userId,
            customerName: t.customerName,
            provider: t.provider,
            amount: t.amount,
            currency: t.currency,
            date: t.date,
            type: t.type,
            status: t.status,
          })),
        )
        .run();
    }

    if (seedTickets.length) {
      db.insert(tables.supportTickets)
        .values(
          seedTickets.map((t) => ({
            id: t.id,
            userId: t.userId,
            userName: t.userName,
            subject: t.subject,
            category: t.category,
            priority: t.priority,
            assignedAgent: t.assignedAgent,
            createdAt: t.createdAt,
            status: t.status,
            messagesJson: JSON.stringify(t.messages),
          })),
        )
        .run();
    }

    if (seedAudit.length) {
      db.insert(tables.auditLogs)
        .values(
          seedAudit.map((a) => ({
            id: a.id,
            adminId: a.adminId,
            adminName: a.adminName,
            adminRole: a.adminRole,
            action: a.action,
            target: a.target,
            result: a.result,
            reason: a.reason,
            ip: a.ip,
            at: a.at,
          })),
        )
        .run();
    }

    db.insert(tables.platformSettings)
      .values({ id: "default", json: JSON.stringify(settings), updatedAt: now })
      .run();

    // Do not persist seed overviewMetrics snapshots — overview always computes from tables.

    sqlite
      .prepare(
        "INSERT INTO schema_meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      )
      .run("bootstrapped_at", now);
    sqlite
      .prepare(
        "INSERT INTO schema_meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      )
      .run(
        "data_source",
        process.env.FINDTENX_API_URL
          ? "findtenx_api_pending_sync"
          : "local_admin_db_bootstrap",
      );
  })();

  return { bootstrapped: true as const };
}

export function getDataSourceMeta() {
  ensureAdminDatabase();
  const row = getSqlite()
    .prepare("SELECT value FROM schema_meta WHERE key = ?")
    .get("data_source") as { value: string } | undefined;
  const mode = (process.env.PLATFORM_DATA_MODE || "core").trim().toLowerCase();
  return {
    source: row?.value ?? "unknown",
    findtenxApiConfigured: Boolean(process.env.FINDTENX_API_URL),
    findtenxDataConfigured: Boolean(process.env.FINDTENX_DATA_API_URL),
    platformDataMode: mode === "local_dev" ? "local_dev" : "core",
    productionAuthority: "findtenx-core",
  };
}

export function assertDbReady() {
  ensureAdminDatabase();
  return getDb();
}

