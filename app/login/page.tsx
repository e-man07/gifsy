"use client";

// Minimal email + password auth. Creation stays local and anonymous — this only
// exists so people can publish/embed scenes to their account.

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setMsg("Check your email to confirm your account, then sign in.");
        }
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] flex-1 items-center justify-center px-5 py-10">
      <div className="card w-full max-w-sm rounded-2xl bg-panel p-6 sm:p-8">
        <Link href="/" className="font-display text-sm uppercase tracking-widest text-sky">
          ← Gifsy
        </Link>
        <h1 className="mt-3 font-editorial text-3xl text-foreground">
          {mode === "in" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Publishing and embeds need an account. GIFs and stickers stay free and fully on-device; 3D is free to try and never uploads your photo.
        </p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-display text-xs uppercase tracking-wide text-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="card-sm rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-foreground outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-display text-xs uppercase tracking-wide text-muted">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="card-sm rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-foreground outline-none"
            />
          </label>

          {err && <p className="text-sm font-semibold text-petal">{err}</p>}
          {msg && <p className="text-sm font-semibold text-grass">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="btn mt-1 rounded-xl bg-grass py-3 font-display text-sm uppercase tracking-wide text-ink disabled:opacity-40"
          >
            {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setErr(null);
            setMsg(null);
          }}
          className="mt-4 font-display text-xs uppercase tracking-wide text-sky hover:underline"
        >
          {mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
