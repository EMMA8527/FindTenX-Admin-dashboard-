/**
 * Server-only authentication configuration.
 * Secrets must come from environment variables / a secrets manager.
 * Missing or weak values fail closed — never fall back to embedded defaults.
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

/**
 * Accepts a raw bcrypt hash, or `base64:<encoded-hash>` to avoid dotenv `$` expansion issues.
 */
export function normalizePasswordHash(raw: string): string {
  const value = raw.trim();
  if (value.startsWith("base64:")) {
    try {
      return Buffer.from(value.slice("base64:".length), "base64").toString("utf8");
    } catch {
      throw new AuthConfigError("ADMIN_PASSWORD_HASH base64 payload is invalid.");
    }
  }
  return value;
}

export type AuthConfig = {
  sessionSecret: Uint8Array;
  passwordHash: string;
  mfaSecret: string;
};

export function getAuthConfig(): AuthConfig {
  const sessionSecretRaw = readRequired("ADMIN_SESSION_SECRET");
  if (sessionSecretRaw.length < MIN_SESSION_SECRET_LENGTH) {
    throw new AuthConfigError(
      `ADMIN_SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters.`,
    );
  }

  const passwordHash = normalizePasswordHash(readRequired("ADMIN_PASSWORD_HASH"));
  if (!passwordHash.startsWith("$2")) {
    throw new AuthConfigError(
      "ADMIN_PASSWORD_HASH must be a bcrypt hash or base64:<bcrypt-hash> from the setup script.",
    );
  }

  const mfaSecret = readRequired("ADMIN_MFA_SECRET");
  if (mfaSecret.length < 16) {
    throw new AuthConfigError("ADMIN_MFA_SECRET must be a strong TOTP secret (min 16 characters).");
  }

  return {
    sessionSecret: new TextEncoder().encode(sessionSecretRaw),
    passwordHash,
    mfaSecret,
  };
}

export function assertAuthConfigured(): void {
  getAuthConfig();
}
