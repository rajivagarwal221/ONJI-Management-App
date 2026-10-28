"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";

export function InternShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper-soft text-ink-mute">
        <div className="text-sm">Loading…</div>
      </div>
    );
  }

  // Admin lands in admin portal if they hit /intern.
  if (profile?.role === "admin") {
    router.replace("/admin");
    return (
      <div className="grid min-h-dvh place-items-center bg-paper-soft text-ink-mute">
        <div className="text-sm">Redirecting to admin…</div>
      </div>
    );
  }

  if (profile && (profile as { disabled?: boolean }).disabled) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper-soft text-ink">
        <div className="max-w-md rounded-2xl border border-line-strong bg-paper-elev p-6 text-center">
          <h1 className="font-display text-xl font-semibold">Account disabled</h1>
          <p className="mt-2 text-sm text-ink-mute">
            Your account has been disabled by the program team. Please contact
            your admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-paper-soft text-ink">
      <div className="md:grid md:min-h-dvh md:grid-cols-[268px_1fr]">
        <Sidebar />
        <div className="relative min-w-0 overflow-x-clip">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(180,96,31,0.14),transparent_28rem),linear-gradient(180deg,rgba(255,255,255,0.76),rgba(245,238,226,0.92)_18rem,rgba(243,230,216,0.98))]"
          />
          <main className="relative min-w-0 px-4 py-5 sm:px-5 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
