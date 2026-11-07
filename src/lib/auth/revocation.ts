type RevocationEntry = { expiresAt: number };

const globalRevocations = globalThis as unknown as {
  __ftxRevokedSessions?: Map<string, RevocationEntry>;
};

function store() {
  if (!globalRevocations.__ftxRevokedSessions) {
    globalRevocations.__ftxRevokedSessions = new Map();
  }
  return globalRevocations.__ftxRevokedSessions;
}

function sweep(now = Date.now()) {
  const map = store();
  for (const [id, entry] of map) {
    if (entry.expiresAt <= now) map.delete(id);
  }
}

export function revokeSession(jti: string, expiresAtMs: number) {
  if (!jti) return;
  store().set(jti, { expiresAt: expiresAtMs });
  sweep();
}

export function isSessionRevoked(jti: string | undefined | null): boolean {
  if (!jti) return true;
  sweep();
  const entry = store().get(jti);
  if (!entry) return false;
  if (entry.expiresAt <= Date.now()) {
    store().delete(jti);
    return false;
  }
  return true;
}

export function clearRevocations() {
  store().clear();
}
