/**
 * FindTenX backend integration configuration.
 * Core is the authoritative platform backend. Data is analytics/reporting.
 * Never invent successful connectivity — callers must probe live.
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

export function getCoreConfig() {
  const baseUrl = (process.env.FINDTENX_API_URL || "").trim().replace(/\/$/, "");
  const apiKey = (process.env.FINDTENX_ADMIN_API_KEY || "").trim();
  return {
    configured: Boolean(baseUrl),
    baseUrl: baseUrl || null,
    apiKeyConfigured: Boolean(apiKey),
    apiKey: apiKey || null,
  };
}

export function getDataConfig() {
  const baseUrl = (
    process.env.FINDTENX_DATA_API_URL ||
    process.env.FINDTENX_API_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");
  const apiKey = (
    process.env.FINDTENX_DATA_API_KEY ||
    process.env.FINDTENX_ADMIN_API_KEY ||
    ""
  ).trim();
  return {
    configured: Boolean(process.env.FINDTENX_DATA_API_URL || process.env.FINDTENX_API_URL),
    baseUrl: baseUrl || null,
    apiKeyConfigured: Boolean(apiKey),
    apiKey: apiKey || null,
  };
}
