import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("admin sqlite persistence", () => {
  let dbPath = "";
  const previousMode = process.env.PLATFORM_DATA_MODE;

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
    if (previousMode === undefined) delete process.env.PLATFORM_DATA_MODE;
    else process.env.PLATFORM_DATA_MODE = previousMode;
  });

  it("bootstraps users into sqlite only in local_dev and persists status updates", async () => {
    process.env.PLATFORM_DATA_MODE = "local_dev";
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

  it("skips seed bootstrap in core mode", async () => {
    process.env.PLATFORM_DATA_MODE = "core";
    const { ensureAdminDatabase } = await import("@/lib/db/bootstrap");
    const { dbHealth } = await import("@/lib/db/queries");

    const first = ensureAdminDatabase();
    expect(first.bootstrapped).toBe(false);
    expect("skippedSeed" in first && first.skippedSeed).toBe(true);

    const health = dbHealth();
    expect(health.ok).toBe(true);
    expect(health.users).toBe(0);
  });
});
