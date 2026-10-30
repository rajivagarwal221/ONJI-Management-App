"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ChevronRight, Github, Plus, Users2 } from "lucide-react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Input,
  LoadingPanel,
  PageHeader,
} from "@/components/ui";

type Group = {
  id: string;
  name: string;
  color?: string;
  githubOrg?: string | null;
  githubRepo?: string | null;
};

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    githubOrg: "",
    githubRepo: "",
    color: "#A4521E",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const gSnap = await getDocs(collection(firebaseDb(), "groups"));
      const list = gSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Group, "id">),
      }));
      setGroups(list);
      // Count members per group
      const counts: Record<string, number> = {};
      for (const g of list) {
        try {
          const uSnap = await getDocs(
            query(
              collection(firebaseDb(), "users"),
              where("groupId", "==", g.id),
            ),
          );
          counts[g.id] = uSnap.size;
        } catch {
          counts[g.id] = 0;
        }
      }
      setMemberCounts(counts);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken || ""}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({ name: "", githubOrg: "", githubRepo: "", color: "#A4521E" });
      setShowForm(false);
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users2}
        eyebrow="Groups"
        title="Intern groups"
        description="Group interns together to assign shared tasks and link a company GitHub org."
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> New group
          </Button>
        }
      />

      {err && <Banner tone="error">{err}</Banner>}

      {showForm && (
        <Card>
          <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
            <Field label="Group name *">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ML Capstone Team A"
              />
            </Field>
            <Field label="Color">
              <Input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-24"
              />
            </Field>
            <Field label="GitHub organization" hint="e.g. onji-labs">
              <Input
                value={form.githubOrg}
                onChange={(e) => setForm({ ...form, githubOrg: e.target.value })}
                placeholder="onji-labs"
              />
            </Field>
            <Field label="Default repo (owner/name)" hint="Optional — used as the default for tasks.">
              <Input
                value={form.githubRepo}
                onChange={(e) => setForm({ ...form, githubRepo: e.target.value })}
                placeholder="onji-labs/intern-starter"
              />
            </Field>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={busy}>Create group</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingPanel />
      ) : groups.length === 0 ? (
        <Empty
          icon={Users2}
          title="No groups yet"
          description="Create a group to start assigning tasks."
          action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New group</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {groups.map((g) => (
            <Card key={g.id} interactive>
              <Link href={`/admin/groups/${g.id}`} className="flex items-start justify-between gap-3 no-underline text-ink">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-10 w-10 shrink-0 rounded-xl"
                    style={{ background: g.color || "#A4521E" }}
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-ink">{g.name}</h2>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
                      <Chip>{memberCounts[g.id] ?? 0} members</Chip>
                      {g.githubOrg && (
                        <Chip tone="brand">
                          <Github className="h-3 w-3" /> {g.githubOrg}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink-mute" />
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
