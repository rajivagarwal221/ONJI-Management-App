"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import { firebaseAuth } from "@/lib/firebase";
import { Card, Chip, PageHeader } from "@/components/ui";
import { KeyRound, Power } from "lucide-react";

type Intern = {
  uid: string;
  displayName: string;
  email: string;
  referenceNo?: string;
  primaryTrack?: string;
  cohort?: string;
  disabled?: boolean;
  activeSessionId?: string | null;
};

export default function InternsListPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const snap = await getDocs(
        query(
          collection(firebaseDb(), "users"),
          where("role", "==", "intern"),
          orderBy("referenceNo"),
        ),
      );
      setInterns(
        snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Intern, "uid">) })),
      );
    } catch {
      // Index building or no interns yet
      try {
        const snap = await getDocs(
          query(collection(firebaseDb(), "users"), where("role", "==", "intern")),
        );
        setInterns(
          snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Intern, "uid">) })),
        );
      } catch {
        setInterns([]);
      }
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function tokenHeader(): Promise<HeadersInit> {
    const u = firebaseAuth().currentUser;
    const t = await u?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t || ""}`,
    };
  }

  async function resetPassword(uid: string) {
    if (!confirm("Reset this intern's password and email them a new one?")) return;
    setBusy(uid);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: await tokenHeader(),
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        data.emailStatus === "sent"
          ? "New password emailed."
          : `Password reset, but email failed: ${data.emailError}. New password: ${data.password}`,
      );
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function toggleIntern(uid: string, disabled: boolean) {
    if (!confirm(disabled ? "Disable this intern?" : "Re-enable this intern?")) return;
    setBusy(uid);
    try {
      const res = await fetch("/api/admin/toggle-intern", {
        method: "POST",
        headers: await tokenHeader(),
        body: JSON.stringify({ uid, disabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interns"
        title="All interns"
        description="Everyone the program has onboarded. Use the action icons on each row."
        action={
          <Link
            href="/admin/interns/new"
            className="h-9 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover grid place-items-center"
          >
            Provision new intern
          </Link>
        }
      />

      {msg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        {interns.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-mute">
            No interns yet. Click <b>Provision new intern</b> to add one.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[140px_1fr_1fr_120px_120px_120px_140px] items-center gap-3 border-b border-line bg-paper-soft px-5 py-3 text-xs uppercase tracking-wide text-ink-mute">
              <span>Ref No.</span>
              <span>Name</span>
              <span>Email</span>
              <span>Track</span>
              <span>Cohort</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-line">
              {interns.map((i) => (
                <li
                  key={i.uid}
                  className="grid grid-cols-[140px_1fr_1fr_120px_120px_120px_140px] items-center gap-3 px-5 py-3 text-sm"
                >
                  <span className="font-mono text-xs text-ink-mute">
                    {i.referenceNo || "—"}
                  </span>
                  <span className="truncate text-ink">{i.displayName}</span>
                  <span className="truncate text-ink-mute">{i.email}</span>
                  <span className="text-ink-mute">{i.primaryTrack || "—"}</span>
                  <span className="text-ink-mute">{i.cohort || "—"}</span>
                  <span>
                    {i.disabled ? (
                      <Chip tone="warn">Disabled</Chip>
                    ) : i.activeSessionId ? (
                      <Chip tone="success">Signed in</Chip>
                    ) : (
                      <Chip>Idle</Chip>
                    )}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      disabled={busy === i.uid}
                      title="Reset password & email new credentials"
                      onClick={() => void resetPassword(i.uid)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white hover:border-ink/40 disabled:opacity-50"
                    >
                      <KeyRound className="h-4 w-4 text-ink-mute" />
                    </button>
                    <button
                      disabled={busy === i.uid}
                      title={i.disabled ? "Re-enable" : "Disable"}
                      onClick={() => void toggleIntern(i.uid, !i.disabled)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white hover:border-ink/40 disabled:opacity-50"
                    >
                      <Power className={`h-4 w-4 ${i.disabled ? "text-emerald-600" : "text-red-500"}`} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
