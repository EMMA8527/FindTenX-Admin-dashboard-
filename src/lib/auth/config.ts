/**
 * Server-only authentication configuration.
 * Session signing secret comes from the environment / secrets manager.
 * Per-admin passwords and MFA secrets live in the admin database — never as shared globals.
 */

export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

const MIN_SESSION_SECRET_LENGTH = 32;

function readRequired(name: string): string {
  let value = process.env[name]?.trim();
  if (!value) {
    throw new AuthConfigError(
      `Missing required authentication secret: ${name}. Configure it via secure environment variables.`,
    );
  }
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

export type AuthConfig = {
  sessionSecret: Uint8Array;
  /** Raw session secret string — also derives MFA-at-rest encryption. */
  sessionSecretRaw: string;
};

export function getAuthConfig(): AuthConfig {
  const sessionSecretRaw = readRequired("ADMIN_SESSION_SECRET");
  if (sessionSecretRaw.length < MIN_SESSION_SECRET_LENGTH) {
    throw new AuthConfigError(
      `ADMIN_SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters.`,
    );
  }

  return {
    sessionSecret: new TextEncoder().encode(sessionSecretRaw),
    sessionSecretRaw,
  };
}

export function assertAuthConfigured(): void {
  getAuthConfig();
}

/** @deprecated Shared global password hashes are no longer used. Kept for migration messaging only. */
export function normalizePasswordHash(raw: string): string {
  const value = raw.trim();
  if (value.startsWith("base64:")) {
    try {
      return Buffer.from(value.slice("base64:".length), "base64").toString("utf8");
    } catch {
      throw new AuthConfigError("Password hash base64 payload is invalid.");
    }
  }
  return value;
}
