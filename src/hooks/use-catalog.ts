"use client";

import { useEffect, useState } from "react";

export function useCatalog<T = unknown>(resource: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authority, setAuthority] = useState<string>("unavailable");
  const [notice, setNotice] = useState("");
  const [production, setProduction] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/catalog?resource=${encodeURIComponent(resource)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) {
          setAuthority(json.authority || "unavailable");
          setNotice(json.error || "Unable to load");
          setProduction(false);
          throw new Error(json.error || "Unable to load");
        }
        setData(json as T);
        setAuthority(json.authority || "unknown");
        setNotice(json.notice || "");
        setProduction(Boolean(json.production));
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [resource]);

  return { data, loading, error, authority, notice, production, setData };
}
