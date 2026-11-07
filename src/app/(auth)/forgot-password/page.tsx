"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to request reset.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-8 shadow-2xl">
        <BrandLogo className="mb-6" />
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your administrator email. If the account exists, a secure reset token is created
          server-side. Delivery requires a configured email provider.
        </p>
        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-500">
              If an administrator account exists for that email, a reset token was created.
            </p>
            <Button render={<Link href="/login" />} className="w-full brand-gradient border-0 text-white">
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" disabled={loading} className="w-full brand-gradient border-0 text-white">
              {loading ? "Submitting..." : "Send reset link"}
            </Button>
            <Link href="/login" className="block text-center text-sm text-brand-pink hover:underline">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
