"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, PageHeader } from "@/components/ui";
import { Database, Users, UserPlus, LayoutDashboard } from "lucide-react";

export default function AdminHome() {
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [seedErr, setSeedErr] = useState<string | null>(null);

  async function load() {
    try {
      const all = await getDocs(
        query(collection(firebaseDb(), "users"), where("role", "==", "intern")),
      );
      let active = 0;
      let disabled = 0;
      all.forEach((d) => {
        const data = d.data() as { disabled?: boolean };
        if (data.disabled) disabled++;
        else active++;
      });
      setStats({ total: all.size, active, disabled });
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function seed() {
    setSeedBusy(true);
    setSeedMsg(null);
    setSeedErr(null);
    try {
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken || ""}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const c = data.counts || {};
      setSeedMsg(
        `Seeded ${c.tracks} tracks, ${c.assignments} assignments, ${c.resources} resources, ${c.announcements} announcements, ${c.courses} courses, ${c.events} events.`,
      );
    } catch (ex) {
      setSeedErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setSeedBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Admin"
        title="Program overview"
        description="Manage interns, generate credentials, and seed program data."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card interactive>
          <div className="flex items-center gap-2 text-ink-mute">
            <Users className="h-4 w-4" />
            <span className="eyebrow">Total interns</span>
          </div>
          <div className="mt-3 font-display text-4xl font-semibold">{stats.total}</div>
        </Card>
        <Card interactive>
          <span className="eyebrow">Active</span>
          <div className="mt-3 font-display text-4xl font-semibold text-emerald-700">
            {stats.active}
          </div>
        </Card>
        <Card interactive>
          <span className="eyebrow">Disabled</span>
          <div className="mt-3 font-display text-4xl font-semibold text-red-600">
            {stats.disabled}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="eyebrow">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button href="/admin/interns/new">
            <UserPlus className="h-4 w-4" /> Provision a new intern
          </Button>
          <Button variant="secondary" href="/admin/interns">
            View all interns
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="eyebrow">Program data</h2>
            <p className="mt-2 text-sm text-ink-mute">
              Populate the public reference collections (tracks, assignments,
              resources, announcements, courses, events). Idempotent — safe to
              run again whenever you add or update content.
            </p>
          </div>
          <Button variant="secondary" onClick={seed} loading={seedBusy}>
            <Database className="h-4 w-4" />
            {seedBusy ? "Seeding…" : "Seed / refresh starter content"}
          </Button>
        </div>
        {seedMsg && <div className="mt-4"><Banner tone="success">{seedMsg}</Banner></div>}
        {seedErr && <div className="mt-4"><Banner tone="error">{seedErr}</Banner></div>}
      </Card>

      <Card>
        <h2 className="eyebrow">First-time setup</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-mute">
          <li>Click <b>Seed / refresh starter content</b> above (do this once).</li>
          <li>Click <b>Provision a new intern</b> — credentials are generated and emailed automatically.</li>
          <li>The intern logs in with those credentials and is walked through a step-by-step guide on their dashboard.</li>
        </ol>
      </Card>
    </div>
  );
}
