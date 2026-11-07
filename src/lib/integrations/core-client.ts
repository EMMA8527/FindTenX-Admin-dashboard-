import { getCoreConfig } from "@/lib/integrations/config";
import { integrationFetch, type IntegrationFetchResult } from "@/lib/integrations/http";

export type CoreProbe = {
  service: "findtenx-core";
  configured: boolean;
  apiKeyConfigured: boolean;
  reachable: boolean;
  authenticated: boolean | null;
  baseUrl: string | null;
  canonicalProductionUrl: string;
  checkedPaths: Array<{ path: string; status: number; ok: boolean; error?: string; latencyMs: number }>;
  message: string;
  checkedAt: string;
};

/**
 * Probe FindTenX Core using the documented health route first:
 *   GET /api/v1/health  → { ok, service: "findtenx-core", database }
 * Reports real DNS/HTTP results only — never synthesizes success.
 */
export async function probeFindtenxCore(): Promise<CoreProbe> {
  const config = getCoreConfig();
  const checkedAt = new Date().toISOString();

  if (!config.configured || !config.baseUrl) {
    return {
      service: "findtenx-core",
      configured: false,
      apiKeyConfigured: config.apiKeyConfigured,
      reachable: false,
      authenticated: null,
      baseUrl: null,
      canonicalProductionUrl: config.canonicalProductionUrl,
      checkedPaths: [],
      message:
        `FINDTENX_API_URL is not configured. Set it to the production Core host (${config.canonicalProductionUrl}) once DNS resolves and Core is deployed.`,
      checkedAt,
    };
  }

  // Public health first; then admin health when FINDTENX_ADMIN_API_KEY is set.
  const candidates = config.apiKeyConfigured
    ? ["/api/v1/health", "/api/v1/admin/health"]
    : ["/api/v1/health"];
  const checkedPaths: CoreProbe["checkedPaths"] = [];
  let reachable = false;
  let authenticated: boolean | null = null;

  for (const path of candidates) {
    const result = await integrationFetch(`${config.baseUrl}${path}`, {
      method: "GET",
      apiKey: path.startsWith("/api/v1/admin/") ? config.apiKey : null,
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
    if (path.startsWith("/api/v1/admin/") && (result.status === 401 || result.status === 403)) {
      authenticated = false;
    }
    if (path.startsWith("/api/v1/admin/") && result.ok) {
      authenticated = true;
      break;
    }
    if (!path.startsWith("/api/v1/admin/") && result.ok && !config.apiKeyConfigured) {
      break;
    }
  }

  let message: string;
  if (!reachable) {
    message =
      "Core base URL is set but unreachable (DNS/TLS/network). Confirmed NXDOMAIN for api.findtenx.app until DNS is provisioned.";
  } else if (authenticated === false) {
    message =
      "Core is reachable but rejected credentials. FindTenX-Core currently uses user JWT Bearer auth; an admin API-key scheme is not yet exposed in Core.";
  } else if (checkedPaths.some((p) => p.ok)) {
    message = "Core responded successfully to at least one probe path.";
  } else {
    message =
      "Core host responded but /api/v1/health (and fallbacks) did not succeed. Map admin routes after Core admin APIs exist.";
  }

  return {
    service: "findtenx-core",
    configured: true,
    apiKeyConfigured: config.apiKeyConfigured,
    reachable,
    authenticated,
    baseUrl: config.baseUrl,
    canonicalProductionUrl: config.canonicalProductionUrl,
    checkedPaths,
    message,
    checkedAt,
  };
}

export async function coreGet<T = unknown>(
  path: string,
): Promise<IntegrationFetchResult<T>> {
  const config = getCoreConfig();
  if (!config.baseUrl) {
    return {
      ok: false,
      status: 0,
      url: path,
      latencyMs: 0,
      error: "FINDTENX_API_URL is not configured",
    };
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return integrationFetch<T>(`${config.baseUrl}${normalized}`, {
    method: "GET",
    apiKey: config.apiKey,
  });
}

export async function coreSend<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<IntegrationFetchResult<T>> {
  const config = getCoreConfig();
  if (!config.baseUrl) {
    return {
      ok: false,
      status: 0,
      url: path,
      latencyMs: 0,
      error: "FINDTENX_API_URL is not configured",
    };
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return integrationFetch<T>(`${config.baseUrl}${normalized}`, {
    method: init.method ?? "POST",
    apiKey: config.apiKey,
    headers: { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}
