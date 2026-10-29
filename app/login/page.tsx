"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import { OnjiMark } from "@/components/Logo";

function LoginInner() {
  const router = useRouter();
  const { signIn, loading, user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect once we know who they are. Admins → /admin, interns → /intern.
  if (!loading && user) {
    const dest =
      (profile?.role === "admin" ||
        user.email?.toLowerCase() ===
          (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "onjisoftware@gmail.com").toLowerCase())
        ? "/admin"
        : "/intern";
    router.replace(dest);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Redirect handled above once user state updates.
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : "Something went wrong";
      setErr(msg.replace("Firebase: ", ""));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-paper-soft px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line-strong bg-paper-elev p-6 shadow-sm shadow-ink/5">
        <div className="flex items-center gap-3">
          <OnjiMark className="h-10 w-10" />
          <div>
            <div className="font-display text-xl font-bold text-ink">ONJI</div>
            <div className="text-xs text-ink-mute">Internship portal</div>
          </div>
        </div>

        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
          Sign in to your account
        </h1>
        <p className="mt-1 text-sm text-ink-mute">
          Use the credentials emailed to you by the program team.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="you@example.com"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="From your welcome email"
            />
          </label>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-10 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover active:bg-brand-press disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t border-line pt-4 text-center text-xs text-ink-mute">
          Don&apos;t have an account? Accounts are provisioned by the program
          team — reach out at{" "}
          <a
            className="font-medium text-brand hover:underline"
            href="mailto:onjisoftware@gmail.com"
          >
            onjisoftware@gmail.com
          </a>
          .
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginInner />
    </AuthProvider>
  );
}
