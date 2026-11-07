import { desc, eq } from "drizzle-orm";
import { assertDbReady } from "@/lib/db/bootstrap";
import * as t from "@/lib/db/schema";
import {
  admins as seedAdmins,
  discoveryConfig,
  notifications,
  plans,
  promotions,
  settings,
} from "@/lib/data/seed";

export function listVerifications(limit = 200) {
  const db = assertDbReady();
  return db.select().from(t.verifications).orderBy(desc(t.verifications.submittedAt)).limit(limit).all();
}

export function listMatches(limit = 200) {
  const db = assertDbReady();
  return db.select().from(t.matches).orderBy(desc(t.matches.matchedAt)).limit(limit).all();
}

export function listLikes(limit = 200) {
  const db = assertDbReady();
  return db.select().from(t.likes).orderBy(desc(t.likes.createdAt)).limit(limit).all();
}

export function listConversations(limit = 200) {
  const db = assertDbReady();
  return db
    .select()
    .from(t.conversations)
    .orderBy(desc(t.conversations.lastMessageAt))
    .limit(limit)
    .all()
    .map((row) => ({
      ...row,
      participants: JSON.parse(row.participantsJson || "[]"),
      participantNames: JSON.parse(row.participantNamesJson || "[]"),
    }));
}

export function listReports(limit = 200) {
  const db = assertDbReady();
  return db.select().from(t.reports).orderBy(desc(t.reports.submittedAt)).limit(limit).all();
}

export function listSubscriptions(limit = 200) {
  const db = assertDbReady();
  return db.select().from(t.subscriptions).orderBy(desc(t.subscriptions.startedAt)).limit(limit).all();
}

export function listTransactions(limit = 200) {
  const db = assertDbReady();
  return db.select().from(t.transactions).orderBy(desc(t.transactions.date)).limit(limit).all();
}

export function listTickets(limit = 200) {
  const db = assertDbReady();
  return db
    .select()
    .from(t.supportTickets)
    .orderBy(desc(t.supportTickets.createdAt))
    .limit(limit)
    .all()
    .map((row) => ({
      ...row,
      messages: JSON.parse(row.messagesJson || "[]"),
    }));
}

export function listAdmins() {
  const db = assertDbReady();
  const rows = db.select().from(t.admins).all();
  return rows.length ? rows : seedAdmins;
}

export function getSettings() {
  const db = assertDbReady();
  const row = db.select().from(t.platformSettings).where(eq(t.platformSettings.id, "default")).get();
  if (!row) return settings;
  try {
    return JSON.parse(row.json);
  } catch {
    return settings;
  }
}

export function getStaticCatalog() {
  return {
    plans,
    notifications,
    promotions,
    discovery: discoveryConfig,
    referrals: [],
    communications: { email: [], sms: [], push: [] },
    fraudAlerts: [],
    websiteContent: [],
  };
}
