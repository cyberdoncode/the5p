"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { Button, Field, Input } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        body: mode === "signup" ? { name, email, password } : { email, password },
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="glow" style={{ top: "-120px", left: "30%", width: "520px", height: "300px", background: "rgba(200,163,90,0.2)" }} />
      <div className="relative z-10 w-full max-w-[420px] rise">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(200,163,90,0.45)] bg-[rgba(200,163,90,0.1)]">
            <span className="display text-lg text-[var(--accent)]">5</span>
          </div>
          <span className="display text-2xl">THE5P</span>
        </Link>

        <div className="panel p-8">
          <h1 className="display text-3xl">
            {mode === "signup" ? "Build your system" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "signup"
              ? "One account. Your whole life, prepared."
              : "Pick up exactly where you left off."}
          </p>

          <div className="mt-7 space-y-4">
            {mode === "signup" ? (
              <Field label="Name">
                <Input value={name} onChange={setName} placeholder="Don" autoFocus />
              </Field>
            ) : null}
            <Field label="Email">
              <Input value={email} onChange={setEmail} type="email" placeholder="you@example.com" autoFocus={mode === "login"} />
            </Field>
            <Field label="Password">
              <Input value={password} onChange={setPassword} type="password" placeholder="At least 8 characters" onEnter={submit} />
            </Field>

            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

            <Button variant="primary" onClick={submit} disabled={busy} className="w-full py-3">
              {busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signup" ? (
            <>
              Already prepared? <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in</Link>
            </>
          ) : (
            <>
              New here? <Link href="/signup" className="text-[var(--accent)] hover:underline">Create your system</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
