"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/logo";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [mfaCode, setMfaCode] = useState("");
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          remember,
          mfaCode: requiresMfa ? mfaCode : undefined,
        }),
      });
      const data = await res.json();
      if (data.requiresMfa) {
        setRequiresMfa(true);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-brand-pink/25 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-black p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(90deg,rgba(255,140,0,0.35),rgba(255,20,147,0.35))] blur-3xl" />
          <BrandLogo size="lg" className="relative [&_p]:text-white [&_p.text-muted-foreground]:text-white/70" />
          <div className="relative flex flex-1 flex-col items-center justify-center py-8">
            <Image
              src="/brand/logo.jpg"
              alt="FindTenX heart figures logo"
              width={192}
              height={192}
              priority
              className="h-48 w-48 rounded-3xl object-cover shadow-[0_0_60px_rgba(255,20,147,0.35)] ring-1 ring-white/10"
            />
          </div>
          <div className="relative">
            <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
              Enterprise control for{" "}
              <span className="brand-gradient-text">FindTenX</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Securely manage users, verification, safety, subscriptions, and revenue from one
              administration portal.
            </p>
            <p className="mt-8 text-xs text-white/55">Authorized personnel only · All actions audited</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8 lg:hidden">
            <BrandLogo />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Administrator sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your FindTenX admin credentials to continue.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-brand-pink hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {requiresMfa ? (
              <div className="space-y-2 rounded-2xl border border-brand-pink/30 bg-brand-pink/5 p-4">
                <Label htmlFor="mfa">Authenticator code</Label>
                <Input
                  id="mfa"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the code from your authenticator app.
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
              />
              <Label htmlFor="remember" className="font-normal">
                Remember me on this device
              </Label>
            </div>

            {error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg brand-gradient border-0 text-sm font-medium text-white shadow-lg shadow-pink-500/20 transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
