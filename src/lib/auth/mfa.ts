import { Secret, TOTP } from "otpauth";

function createTotp(secretBase32: string, label = "Administrator") {
  return new TOTP({
    issuer: "FindTenX Admin",
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32.replace(/\s+/g, "").toUpperCase()),
  });
}

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpUri(secretBase32: string, email: string): string {
  return createTotp(secretBase32, email).toString();
}

export function verifyTotpCode(secretBase32: string, code: string): boolean {
  const normalized = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;

  try {
    const delta = createTotp(secretBase32).validate({ token: normalized, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

export function currentTotpCode(secretBase32: string): string {
  return createTotp(secretBase32).generate();
}
