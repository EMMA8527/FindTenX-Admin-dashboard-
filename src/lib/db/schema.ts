import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatar: text("avatar").notNull().default(""),
  mfaEnabled: integer("mfa_enabled", { mode: "boolean" }).notNull().default(true),
  status: text("status").notNull().default("active"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").notNull().default(""),
    age: integer("age").notNull().default(18),
    dateOfBirth: text("date_of_birth"),
    country: text("country").notNull().default(""),
    city: text("city").notNull().default(""),
    gender: text("gender").notNull().default("other"),
    avatar: text("avatar").notNull().default(""),
    bio: text("bio").notNull().default(""),
    interestsJson: text("interests_json").notNull().default("[]"),
    occupation: text("occupation").notNull().default(""),
    education: text("education").notNull().default(""),
    relationshipIntent: text("relationship_intent").notNull().default(""),
    photosJson: text("photos_json").notNull().default("[]"),
    registeredAt: text("registered_at").notNull(),
    lastActiveAt: text("last_active_at").notNull(),
    verificationStatus: text("verification_status").notNull().default("unverified"),
    membership: text("membership").notNull().default("free"),
    subscriptionExpiresAt: text("subscription_expires_at"),
    accountStatus: text("account_status").notNull().default("active"),
    registrationMethod: text("registration_method").notNull().default("Email"),
    likesSent: integer("likes_sent").notNull().default(0),
    likesReceived: integer("likes_received").notNull().default(0),
    matchesCount: integer("matches_count").notNull().default(0),
    conversationsCount: integer("conversations_count").notNull().default(0),
    reportsReceived: integer("reports_received").notNull().default(0),
    reportsSubmitted: integer("reports_submitted").notNull().default(0),
    profileHidden: integer("profile_hidden", { mode: "boolean" }).notNull().default(false),
    completeness: integer("completeness").notNull().default(0),
  },
  (t) => [
    index("users_country_idx").on(t.country),
    index("users_status_idx").on(t.accountStatus),
    index("users_verification_idx").on(t.verificationStatus),
  ],
);

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar").notNull().default(""),
  type: text("type").notNull(),
  submittedAt: text("submitted_at").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull().default("medium"),
  providerResult: text("provider_result").notNull().default(""),
  notes: text("notes").notNull().default(""),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  userAId: text("user_a_id").notNull(),
  userAName: text("user_a_name").notNull(),
  userAAvatar: text("user_a_avatar").notNull().default(""),
  userBId: text("user_b_id").notNull(),
  userBName: text("user_b_name").notNull(),
  userBAvatar: text("user_b_avatar").notNull().default(""),
  matchedAt: text("matched_at").notNull(),
  status: text("status").notNull().default("active"),
});

export const likes = sqliteTable("likes", {
  id: text("id").primaryKey(),
  fromUserId: text("from_user_id").notNull(),
  fromUserName: text("from_user_name").notNull(),
  toUserId: text("to_user_id").notNull(),
  toUserName: text("to_user_name").notNull(),
  createdAt: text("created_at").notNull(),
  membership: text("membership").notNull().default("free"),
  country: text("country").notNull().default(""),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  participantsJson: text("participants_json").notNull(),
  participantNamesJson: text("participant_names_json").notNull(),
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: text("last_message_at").notNull(),
  reported: integer("reported", { mode: "boolean" }).notNull().default(false),
  deliveryErrors: integer("delivery_errors").notNull().default(0),
  status: text("status").notNull().default("active"),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").notNull(),
  reporterName: text("reporter_name").notNull(),
  reportedId: text("reported_id").notNull(),
  reportedName: text("reported_name").notNull(),
  category: text("category").notNull(),
  explanation: text("explanation").notNull().default(""),
  submittedAt: text("submitted_at").notNull(),
  priority: text("priority").notNull().default("medium"),
  assignedModerator: text("assigned_moderator"),
  status: text("status").notNull().default("new"),
  notes: text("notes").notNull().default(""),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  planId: text("plan_id").notNull(),
  planName: text("plan_name").notNull(),
  status: text("status").notNull(),
  startedAt: text("started_at").notNull(),
  renewsAt: text("renews_at"),
  provider: text("provider").notNull().default(""),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  provider: text("provider").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  date: text("date").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
});

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  assignedAgent: text("assigned_agent"),
  createdAt: text("created_at").notNull(),
  status: text("status").notNull().default("open"),
  messagesJson: text("messages_json").notNull().default("[]"),
});

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id").notNull(),
    adminName: text("admin_name").notNull(),
    adminRole: text("admin_role").notNull(),
    action: text("action").notNull(),
    target: text("target").notNull(),
    result: text("result").notNull(),
    reason: text("reason").notNull().default(""),
    ip: text("ip").notNull().default(""),
    at: text("at").notNull(),
  },
  (t) => [index("audit_at_idx").on(t.at)],
);

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const platformSettings = sqliteTable("platform_settings", {
  id: text("id").primaryKey().default("default"),
  json: text("json").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const metricSnapshots = sqliteTable("metric_snapshots", {
  id: text("id").primaryKey().default("current"),
  json: text("json").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});
