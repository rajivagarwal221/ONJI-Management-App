"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import { Card, PageHeader } from "@/components/ui";

export default function NewInternPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    primaryTrack: "ml",
    cohort: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    institute: "",
    startDate: new Date().toISOString().slice(0, 10),
    durationMonths: 4,
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    referenceNo: string;
    emailStatus: "sent" | "failed";
    emailError?: string;
    password?: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const res = await fetch("/api/admin/create-intern", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken || ""}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interns"
        title="Provision a new intern"
        description="Enter the intern's details. We'll generate a secure password, assign a reference number, and email the credentials."
      />

      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Full name
            </span>
            <input
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="Priya Shah"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Email (where credentials go)
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="priya@example.com"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Primary track
            </span>
            <select
              value={form.primaryTrack}
              onChange={(e) => setForm({ ...form, primaryTrack: e.target.value })}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
            >
              <option value="fluency">AI Fluency</option>
              <option value="ml">Machine Learning</option>
              <option value="ai-eng">AI Engineering</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Cohort
            </span>
            <input
              required
              value={form.cohort}
              onChange={(e) => setForm({ ...form, cohort: e.target.value })}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="July 2026"
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Institute (shown on offer letter &amp; certificate)
            </span>
            <input
              value={form.institute}
              onChange={(e) => setForm({ ...form, institute: e.target.value })}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="Lachoo Memorial College of Science and Technology, Jodhpur"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Start date
            </span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Duration (months)
            </span>
            <input
              type="number"
              min={1}
              max={24}
              value={form.durationMonths}
              onChange={(e) =>
                setForm({ ...form, durationMonths: Number(e.target.value) || 4 })
              }
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
            />
          </label>

          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.push("/admin/interns")}
              className="h-10 rounded-xl bg-transparent px-4 text-sm text-ink-mute hover:bg-paper-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover disabled:opacity-60"
            >
              <Mail className="h-4 w-4" />
              {busy ? "Provisioning…" : "Generate credentials & email"}
            </button>
          </div>
        </form>
      </Card>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {result && (
        <Card>
          <h2 className="eyebrow">Account provisioned</h2>
          <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-mute">Reference No.</dt>
              <dd className="font-mono font-semibold">{result.referenceNo}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-mute">Email status</dt>
              <dd className={result.emailStatus === "sent" ? "text-emerald-700" : "text-red-700"}>
                {result.emailStatus === "sent"
                  ? "Sent — credentials delivered."
                  : `Email failed: ${result.emailError}`}
              </dd>
            </div>
            {result.password && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-mute">Temporary password (copy now — not stored)</dt>
                <dd className="font-mono rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
                  {result.password}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}
    </div>
  );
}
