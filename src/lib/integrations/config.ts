/**
 * FindTenX backend integration configuration.
 * Core is the authoritative platform backend. Data is analytics/reporting.
 * Never invent successful connectivity — callers must probe live.
 *
 * Canonical production Core host (from FINDTENX-Mobile + FindTenX-Core docs):
 *   https://api.findtenx.app
 * Health: GET /api/v1/health
 *
 * Data has no published production hostname in findtenx-data yet — require
 * FINDTENX_DATA_API_URL explicitly. Do not reuse Core URL/key as Data.
 */

export type PlatformDataMode = "core" | "local_dev";

export function getPlatformDataMode(): PlatformDataMode {
  const mode = (process.env.PLATFORM_DATA_MODE || "core").trim().toLowerCase();
  return mode === "local_dev" ? "local_dev" : "core";
}

/**
 * Local SQLite platform data is development-only.
 * Production builds refuse it unless ALLOW_LOCAL_PLATFORM_DATA=true is set explicitly.
 */
export function allowLocalPlatformData() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_PLATFORM_DATA !== "true") {
    return false;
  }
  return getPlatformDataMode() === "local_dev";
}

/** Documented production Core base URL — DNS must resolve before it is usable. */
export const CANONICAL_CORE_API_URL = "https://api.findtenx.app";

export function getCoreConfig() {
  const baseUrl = (process.env.FINDTENX_API_URL || "").trim().replace(/\/$/, "");
  const apiKey = (process.env.FINDTENX_ADMIN_API_KEY || "").trim();
  return {
    configured: Boolean(baseUrl),
    baseUrl: baseUrl || null,
    apiKeyConfigured: Boolean(apiKey),
    apiKey: apiKey || null,
    canonicalProductionUrl: CANONICAL_CORE_API_URL,
  };
}

/**
 * FindTenX Data — separate from Core.
 * No Core URL/key fallback: those are different systems and different credentials.
 */
export function getDataConfig() {
  const baseUrl = (process.env.FINDTENX_DATA_API_URL || "").trim().replace(/\/$/, "");
  const apiKey = (process.env.FINDTENX_DATA_API_KEY || "").trim();
  return {
    configured: Boolean(baseUrl),
    baseUrl: baseUrl || null,
    apiKeyConfigured: Boolean(apiKey),
    apiKey: apiKey || null,
  };
}
