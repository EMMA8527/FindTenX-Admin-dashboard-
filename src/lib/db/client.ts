import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

const globalDb = globalThis as unknown as {
  __ftxSqlite?: Database.Database;
  __ftxDrizzle?: ReturnType<typeof drizzle<typeof schema>>;
};

function resolveDbPath() {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    return process.env.DATABASE_URL.replace(/^file:/, "");
  }
  if (process.env.FTX_SQLITE_PATH) return process.env.FTX_SQLITE_PATH;
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "findtenx-admin.sqlite");
}

export function getSqlite() {
  if (!globalDb.__ftxSqlite) {
    const dbPath = resolveDbPath();
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    globalDb.__ftxSqlite = sqlite;
  }
  return globalDb.__ftxSqlite;
}

export function getDb() {
  if (!globalDb.__ftxDrizzle) {
    globalDb.__ftxDrizzle = drizzle(getSqlite(), { schema });
  }
  return globalDb.__ftxDrizzle;
}

export function getDbPath() {
  return resolveDbPath();
}
