"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut, UserPlus, Users } from "lucide-react";
import { OnjiWordmark } from "./Logo";
import { useAuth } from "@/lib/auth";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "onjisoftware@gmail.com"
).toLowerCase();

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/interns", label: "Interns", icon: Users },
  { href: "/admin/interns/new", label: "New intern", icon: UserPlus },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/admin";

  const isAdmin =
    profile?.role === "admin" ||
    user?.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && !isAdmin) router.replace("/intern");
  }, [loading, user, isAdmin, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper-soft text-ink-mute">
        <div className="text-sm">Loading…</div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper-soft text-ink">
        <div className="text-sm">Redirecting…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper-soft text-ink">
      <div className="md:grid md:min-h-dvh md:grid-cols-[240px_1fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-ink text-paper md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
            <div className="absolute inset-0 bg-[#1C0F06]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(180,96,31,0.18),transparent_55%)]" />
          </div>
          <div className="relative flex h-16 items-center gap-2 border-b border-white/10 px-5">
            <OnjiWordmark />
            <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
              Admin
            </span>
          </div>
          <nav className="relative flex-1 px-3 py-4 space-y-0.5">
            {nav.map((n) => {
              const Icon = n.icon;
              const active =
                n.href === pathname ||
                (n.href !== "/admin" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  data-active={active || undefined}
                  className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm text-paper/70 hover:bg-white/[0.07] hover:text-paper data-[active=true]:bg-white/10 data-[active=true]:text-paper"
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="relative border-t border-white/10 p-3 text-xs text-paper/60">
            <div className="truncate">Signed in: {user.email}</div>
            <button
              onClick={() => void signOutUser()}
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>
        <div className="relative min-w-0">
          <main className="relative min-w-0 px-4 py-5 sm:px-5 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
