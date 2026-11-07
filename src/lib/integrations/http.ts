export type IntegrationFetchResult<T = unknown> = {
  ok: boolean;
  status: number;
  url: string;
  latencyMs: number;
  data?: T;
  error?: string;
};

export async function integrationFetch<T = unknown>(
  url: string,
  init: RequestInit & { apiKey?: string | null; timeoutMs?: number } = {},
): Promise<IntegrationFetchResult<T>> {
  const { apiKey, timeoutMs = 8000, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.set("X-Admin-Api-Key", apiKey);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    const text = await res.text();
    let data: T | undefined;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as unknown as T;
      }
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        url,
        latencyMs,
        data,
        error:
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : `HTTP ${res.status}`,
      };
    }
    return { ok: true, status: res.status, url, latencyMs, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : "Request failed",
    };
  } finally {
    clearTimeout(timer);
  }
}
