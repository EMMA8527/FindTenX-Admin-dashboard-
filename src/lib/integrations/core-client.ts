import { getCoreConfig } from "@/lib/integrations/config";
import { integrationFetch, type IntegrationFetchResult } from "@/lib/integrations/http";

export type CoreProbe = {
  service: "findtenx-core";
  configured: boolean;
  apiKeyConfigured: boolean;
  reachable: boolean;
  authenticated: boolean | null;
  baseUrl: string | null;
  checkedPaths: Array<{ path: string; status: number; ok: boolean; error?: string; latencyMs: number }>;
  message: string;
  checkedAt: string;
};

/**
 * Probe FindTenX Core without assuming a specific OpenAPI shape.
 * Tries a small set of common health/admin endpoints and reports real results only.
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
      checkedPaths: [],
      message:
        "FINDTENX_API_URL is not configured. Core is the authoritative platform backend — platform modules cannot sync until it is set and reachable.",
      checkedAt,
    };
  }

  const candidates = ["/health", "/api/health", "/admin/health", "/api/admin/health", "/"];
  const checkedPaths: CoreProbe["checkedPaths"] = [];
  let reachable = false;
  let authenticated: boolean | null = null;

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
    if (result.status === 401 || result.status === 403) authenticated = false;
    if (result.ok) {
      authenticated = config.apiKeyConfigured ? true : authenticated;
      break;
    }
  }

  let message: string;
  if (!reachable) {
    message = "Core base URL is set but no health endpoint responded (network/DNS/TLS or wrong host).";
  } else if (authenticated === false) {
    message = "Core is reachable but rejected admin credentials (check FINDTENX_ADMIN_API_KEY).";
  } else if (checkedPaths.some((p) => p.ok)) {
    message = "Core responded successfully to at least one probe path.";
  } else {
    message =
      "Core host responded but no known health path succeeded. Grant Origin access to findtenx-core so the exact admin routes can be mapped.";
  }

  return {
    service: "findtenx-core",
    configured: true,
    apiKeyConfigured: config.apiKeyConfigured,
    reachable,
    authenticated,
    baseUrl: config.baseUrl,
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
