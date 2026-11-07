import { getDataConfig } from "@/lib/integrations/config";
import { integrationFetch } from "@/lib/integrations/http";

export type DataProbe = {
  service: "findtenx-data";
  configured: boolean;
  apiKeyConfigured: boolean;
  reachable: boolean;
  baseUrl: string | null;
  checkedPaths: Array<{ path: string; status: number; ok: boolean; error?: string; latencyMs: number }>;
  message: string;
  checkedAt: string;
};

export async function probeFindtenxData(): Promise<DataProbe> {
  const config = getDataConfig();
  const checkedAt = new Date().toISOString();

  if (!config.configured || !config.baseUrl) {
    return {
      service: "findtenx-data",
      configured: false,
      apiKeyConfigured: config.apiKeyConfigured,
      reachable: false,
      baseUrl: null,
      checkedPaths: [],
      message:
        "FINDTENX_DATA_API_URL (or FINDTENX_API_URL fallback) is not configured. Analytics/reporting should use FindTenX Data when available.",
      checkedAt,
    };
  }

  const candidates = ["/health", "/api/health", "/analytics/health", "/"];
  const checkedPaths: DataProbe["checkedPaths"] = [];
  let reachable = false;

  for (const path of candidates) {
    const result = await integrationFetch(`${config.baseUrl}${path}`, {
      method: "GET",
      apiKey: config.apiKey,
      timeoutMs: 5000,
    });
    checkedPaths.push({
      path,
      status: result.status,
      ok: result.ok,
      error: result.error,
      latencyMs: result.latencyMs,
    });
    if (result.status > 0) reachable = true;
    if (result.ok) break;
  }

  return {
    service: "findtenx-data",
    configured: true,
    apiKeyConfigured: config.apiKeyConfigured,
    reachable,
    baseUrl: config.baseUrl,
    checkedPaths,
    message: reachable
      ? checkedPaths.some((p) => p.ok)
        ? "FindTenX Data responded to a probe path."
        : "FindTenX Data host responded but no known health path succeeded."
      : "FindTenX Data base URL is set but unreachable.",
    checkedAt,
  };
}
