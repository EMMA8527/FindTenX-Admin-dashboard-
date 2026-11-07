import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("platform integration gate", () => {
  const original = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("fails closed when Core is not configured and local_dev is off", async () => {
    delete process.env.FINDTENX_API_URL;
    delete process.env.FINDTENX_ADMIN_API_KEY;
    process.env.PLATFORM_DATA_MODE = "core";

    const { resolvePlatformAccess } = await import("@/lib/integrations/platform");
    const access = await resolvePlatformAccess();
    expect(access.ok).toBe(false);
    if (!access.ok) {
      expect(access.code).toBe("CORE_REQUIRED");
      expect(access.status).toBe(503);
      expect(access.authority).toBe("unavailable");
    }
  });

  it("allows explicit local_dev mode without claiming production", async () => {
    delete process.env.FINDTENX_API_URL;
    process.env.PLATFORM_DATA_MODE = "local_dev";
    Object.defineProperty(process.env, "NODE_ENV", { value: "development", configurable: true });

    const { resolvePlatformAccess } = await import("@/lib/integrations/platform");
    const access = await resolvePlatformAccess();
    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(access.authority).toBe("admin_local_dev");
      expect(access.production).toBe(false);
    }
  });

  it("refuses local_dev in production builds without ALLOW_LOCAL_PLATFORM_DATA", async () => {
    delete process.env.FINDTENX_API_URL;
    process.env.PLATFORM_DATA_MODE = "local_dev";
    Object.defineProperty(process.env, "NODE_ENV", { value: "production", configurable: true });
    delete process.env.ALLOW_LOCAL_PLATFORM_DATA;

    const { resolvePlatformAccess } = await import("@/lib/integrations/platform");
    const access = await resolvePlatformAccess();
    expect(access.ok).toBe(false);
  });

  it("reports Core as not configured in probe", async () => {
    delete process.env.FINDTENX_API_URL;
    const { probeFindtenxCore } = await import("@/lib/integrations/core-client");
    const probe = await probeFindtenxCore();
    expect(probe.configured).toBe(false);
    expect(probe.reachable).toBe(false);
    expect(probe.checkedPaths).toEqual([]);
  });

  it("does not invent successful Core connectivity for bad hosts", async () => {
    process.env.FINDTENX_API_URL = "http://127.0.0.1:1";
    process.env.FINDTENX_ADMIN_API_KEY = "test-key";
    process.env.PLATFORM_DATA_MODE = "core";

    const { probeFindtenxCore } = await import("@/lib/integrations/core-client");
    const probe = await probeFindtenxCore();
    expect(probe.configured).toBe(true);
    expect(probe.reachable).toBe(false);
    expect(probe.checkedPaths.some((p) => p.ok)).toBe(false);
  });

  it("does not treat Core URL/key as FindTenX Data credentials", async () => {
    process.env.FINDTENX_API_URL = "https://api.findtenx.app";
    process.env.FINDTENX_ADMIN_API_KEY = "core-only-key";
    delete process.env.FINDTENX_DATA_API_URL;
    delete process.env.FINDTENX_DATA_API_KEY;

    const { getDataConfig } = await import("@/lib/integrations/config");
    const { probeFindtenxData } = await import("@/lib/integrations/data-client");
    const cfg = getDataConfig();
    expect(cfg.configured).toBe(false);
    expect(cfg.baseUrl).toBeNull();
    expect(cfg.apiKeyConfigured).toBe(false);

    const probe = await probeFindtenxData();
    expect(probe.configured).toBe(false);
    expect(probe.reachable).toBe(false);
  });
});

