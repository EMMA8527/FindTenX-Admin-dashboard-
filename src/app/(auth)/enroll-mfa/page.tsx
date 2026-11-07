"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EnrollMfaPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/auth/mfa/enroll");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to start MFA enrollment.");
        return;
      }
      setSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/mfa/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to confirm MFA.");
        return;
      }
      setRecoveryCodes(data.recoveryCodes || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-lg space-y-6 p-8">
        <BrandLogo size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enroll authenticator MFA</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each administrator must enroll their own TOTP authenticator. Shared MFA secrets are not
            allowed.
          </p>
        </div>

        {recoveryCodes ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Save these recovery codes now</p>
            <ul className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary/40 p-4 font-mono text-xs">
              {recoveryCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Button className="w-full brand-gradient border-0 text-white" onClick={() => router.replace("/")}>
              Continue to dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {otpauthUrl ? (
              <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-4 text-sm">
                <p className="font-medium">Authenticator setup</p>
                <p className="break-all text-xs text-muted-foreground">{otpauthUrl}</p>
                <p className="text-xs text-muted-foreground">
                  Manual secret: <span className="font-mono text-foreground">{secret}</span>
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={loading || !secret} className="w-full brand-gradient border-0 text-white">
              {loading ? "Confirming…" : "Confirm MFA"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
