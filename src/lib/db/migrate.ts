import { getSqlite } from "@/lib/db/client";

/** Lightweight SQL migrations (idempotent) for the admin platform DB. */
export function migrateAdminDb() {
  const db = getSqlite();
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      mfa_enabled INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      age INTEGER NOT NULL DEFAULT 18,
      date_of_birth TEXT,
      country TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL DEFAULT 'other',
      avatar TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      interests_json TEXT NOT NULL DEFAULT '[]',
      occupation TEXT NOT NULL DEFAULT '',
      education TEXT NOT NULL DEFAULT '',
      relationship_intent TEXT NOT NULL DEFAULT '',
      photos_json TEXT NOT NULL DEFAULT '[]',
      registered_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'unverified',
      membership TEXT NOT NULL DEFAULT 'free',
      subscription_expires_at TEXT,
      account_status TEXT NOT NULL DEFAULT 'active',
      registration_method TEXT NOT NULL DEFAULT 'Email',
      likes_sent INTEGER NOT NULL DEFAULT 0,
      likes_received INTEGER NOT NULL DEFAULT 0,
      matches_count INTEGER NOT NULL DEFAULT 0,
      conversations_count INTEGER NOT NULL DEFAULT 0,
      reports_received INTEGER NOT NULL DEFAULT 0,
      reports_submitted INTEGER NOT NULL DEFAULT 0,
      profile_hidden INTEGER NOT NULL DEFAULT 0,
      completeness INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS users_country_idx ON users(country);
    CREATE INDEX IF NOT EXISTS users_status_idx ON users(account_status);
    CREATE INDEX IF NOT EXISTS users_verification_idx ON users(verification_status);

    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      user_name TEXT NOT NULL,
      user_avatar TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      provider_result TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user_a_id TEXT NOT NULL,
      user_a_name TEXT NOT NULL,
      user_a_avatar TEXT NOT NULL DEFAULT '',
      user_b_id TEXT NOT NULL,
      user_b_name TEXT NOT NULL,
      user_b_avatar TEXT NOT NULL DEFAULT '',
      matched_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      from_user_name TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      to_user_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      membership TEXT NOT NULL DEFAULT 'free',
      country TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participants_json TEXT NOT NULL,
      participant_names_json TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      last_message_at TEXT NOT NULL,
      reported INTEGER NOT NULL DEFAULT 0,
      delivery_errors INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reported_id TEXT NOT NULL,
      reported_name TEXT NOT NULL,
      category TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT '',
      submitted_at TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      assigned_moderator TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      renews_at TEXT,
      provider TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      provider TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      assigned_agent TEXT,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      messages_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      admin_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      result TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS audit_at_idx ON audit_logs(at);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS metric_snapshots (
      id TEXT PRIMARY KEY DEFAULT 'current',
      json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
