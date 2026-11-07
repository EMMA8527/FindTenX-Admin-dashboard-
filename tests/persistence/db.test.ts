import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("admin sqlite persistence", () => {
  let dbPath = "";

  beforeEach(() => {
    dbPath = path.join(os.tmpdir(), `ftx-admin-test-${Date.now()}-${Math.random()}.sqlite`);
    process.env.FTX_SQLITE_PATH = dbPath;
    const g = globalThis as unknown as { __ftxSqlite?: unknown; __ftxDrizzle?: unknown };
    delete g.__ftxSqlite;
    delete g.__ftxDrizzle;
    vi.resetModules();
  });

  afterEach(() => {
    const g = globalThis as unknown as { __ftxSqlite?: { close?: () => void }; __ftxDrizzle?: unknown };
    try {
      g.__ftxSqlite?.close?.();
    } catch {
      /* ignore */
    }
    delete g.__ftxSqlite;
    delete g.__ftxDrizzle;
    if (dbPath && fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch {
        /* ignore */
      }
    }
    delete process.env.FTX_SQLITE_PATH;
  });

  it("bootstraps users into sqlite and persists status updates", async () => {
    const { ensureAdminDatabase } = await import("@/lib/db/bootstrap");
    const { listUsersFromDb, updateUserStatusInDb, getUserFromDb, dbHealth } = await import(
      "@/lib/db/queries"
    );

    const first = ensureAdminDatabase();
    expect(first.bootstrapped).toBe(true);
    const second = ensureAdminDatabase();
    expect(second.bootstrapped).toBe(false);

    const health = dbHealth();
    expect(health.ok).toBe(true);
    expect(health.users).toBeGreaterThan(0);

    const listed = listUsersFromDb({ limit: 10 });
    expect(listed.users.length).toBeGreaterThan(0);
    const id = listed.users[0].id;

    const updated = updateUserStatusInDb(
      id,
      "suspended",
      { id: "adm_001", name: "Emma Paul", role: "super_admin" },
      "Automated persistence test suspension",
    );
    expect(updated?.accountStatus).toBe("suspended");
    expect(getUserFromDb(id)?.accountStatus).toBe("suspended");
  });
});
