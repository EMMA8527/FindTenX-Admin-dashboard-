import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "node:crypto";

const PREFIX = "v1";

function deriveKey(material: string): Buffer {
  // Deterministic 32-byte key from the server session secret (never shipped to clients).
  return scryptSync(material, "findtenx-admin-mfa-v1", 32);
}

export function encryptSecret(plaintext: string, keyMaterial: string): string {
  const key = deriveKey(keyMaterial);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(
    ".",
  );
}

export function decryptSecret(payload: string, keyMaterial: string): string | null {
  try {
    const [version, ivB64, tagB64, dataB64] = payload.split(".");
    if (version !== PREFIX || !ivB64 || !tagB64 || !dataB64) return null;
    const key = deriveKey(keyMaterial);
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64url")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    randomBytes(5).toString("hex").toUpperCase().replace(/(.{4})/g, "$1-").replace(/-$/, ""),
  );
}

/** Valid bcrypt of a non-used string — used only to equalize timing when email is unknown. */
export const DUMMY_PASSWORD_HASH =
  "$2b$12$BILNtwyYamjKw3j6IyxgsuBytMMyKVgHFotxwvMH5m.o5Fl9qrEly";
