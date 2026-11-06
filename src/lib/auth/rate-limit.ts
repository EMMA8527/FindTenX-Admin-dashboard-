type Bucket = { count: number; resetAt: number };

const globalBuckets = globalThis as unknown as {
  __ftxLoginBuckets?: Map<string, Bucket>;
};

function buckets() {
  if (!globalBuckets.__ftxLoginBuckets) {
    globalBuckets.__ftxLoginBuckets = new Map();
  }
  return globalBuckets.__ftxLoginBuckets;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const map = buckets();
  const existing = map.get(key);

  if (!existing || existing.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  map.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetLoginRateLimit(key: string) {
  buckets().delete(key);
}

/** Test helper */
export function clearLoginRateLimits() {
  buckets().clear();
}
