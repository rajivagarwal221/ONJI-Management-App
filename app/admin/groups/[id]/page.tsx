"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  Clock,
  Github,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  Users2,
} from "lucide-react";
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
  Select,
  Textarea,
} from "@/components/ui";

type Group = {
  id: string;
  name: string;
  color?: string;
  githubOrg?: string | null;
  githubRepo?: string | null;
};
type Intern = {
  uid: string;
  displayName: string;
  email: string;
  referenceNo?: string;
  groupId?: string | null;
};
type Task = {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string | null;
  repo?: string | null;
  branch?: string | null;
  dueDate?: Timestamp | null;
  status?: "open" | "done";
};

export default function AdminGroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const groupId = params.id;
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Intern[]>([]);
  const [others, setOthers] = useState<Intern[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showTask, setShowTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "all",
    repo: "",
    branch: "",
    dueDate: "",
  });
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const g = await getDoc(doc(firebaseDb(), "groups", groupId));
      if (!g.exists()) {
        setErr("Group not found.");
        return;
      }
      const gData = { id: g.id, ...(g.data() as Omit<Group, "id">) };
      setGroup(gData);
      if (gData.githubRepo) {
        setTaskForm((f) => ({ ...f, repo: f.repo || gData.githubRepo || "" }));
      }

      const [intSnap, tSnap] = await Promise.all([
        getDocs(
          query(collection(firebaseDb(), "users"), where("role", "==", "intern")),
        ),
        getDocs(
          query(collection(firebaseDb(), "tasks"), where("groupId", "==", groupId)),
        ),
      ]);
      const all: Intern[] = intSnap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<Intern, "uid">),
      }));
      setMembers(all.filter((i) => i.groupId === groupId));
      setOthers(all.filter((i) => i.groupId !== groupId));

      const tList = tSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Task, "id">),
      }));
      tList.sort((a, b) => (a.title > b.title ? 1 : -1));
      setTasks(tList);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  async function tokenHeader(): Promise<HeadersInit> {
    const u = firebaseAuth().currentUser;
    const t = await u?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t || ""}`,
    };
  }

  async function toggleMember(uid: string, add: boolean) {
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/group-member", {
        method: "POST",
        headers: await tokenHeader(),
        body: JSON.stringify({ uid, groupId: add ? groupId : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: await tokenHeader(),
        body: JSON.stringify({
          groupId,
          title: taskForm.title,
          description: taskForm.description,
          assignedTo: taskForm.assignedTo === "all" ? null : taskForm.assignedTo,
          repo: taskForm.repo || null,
          branch: taskForm.branch || null,
          dueDate: taskForm.dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTaskForm((f) => ({
        ...f,
        title: "",
        description: "",
        dueDate: "",
      }));
      setShowTask(false);
      setMsg("Task created.");
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Users2} eyebrow="Group" title="Loading…" />
        <LoadingPanel />
      </div>
    );
  }
  if (!group) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Users2} eyebrow="Group" title="Not found" />
        <Banner tone="error">{err || "Group not found."}</Banner>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users2}
        eyebrow="Group"
        title={group.name}
        description={group.githubOrg ? `Linked to github.com/${group.githubOrg}` : "No GitHub org linked yet."}
      />

      {msg && <Banner tone="success">{msg}</Banner>}
      {err && <Banner tone="error">{err}</Banner>}

      {/* GitHub config */}
      <Card>
        <h2 className="eyebrow">GitHub</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <Chip tone="brand">
            <Github className="h-3 w-3" /> {group.githubOrg || "(none)"}
          </Chip>
          {group.githubRepo && <Chip>{group.githubRepo}</Chip>}
        </div>
        <p className="mt-3 text-xs text-ink-mute">
          Set GITHUB_TOKEN on Vercel to let the portal fetch commits from this org.
        </p>
      </Card>

      {/* Members */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="eyebrow">Members</h2>
          <Chip tone="brand">{members.length}</Chip>
        </div>
        {members.length === 0 ? (
          <p className="mt-3 text-sm text-ink-mute">No members yet. Add from the list below.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {members.map((m) => (
              <li
                key={m.uid}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium text-ink">{m.displayName}</div>
                  <div className="text-xs text-ink-mute">
                    {m.email}
                    {m.referenceNo && <span className="font-mono"> · {m.referenceNo}</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleMember(m.uid, false)}>
                  <UserMinus className="h-3.5 w-3.5" /> Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        {others.length > 0 && (
          <>
            <h3 className="eyebrow mt-5">Add interns</h3>
            <ul className="mt-2 divide-y divide-line">
              {others.map((o) => (
                <li
                  key={o.uid}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div>
                    <div className="text-ink">{o.displayName}</div>
                    <div className="text-xs text-ink-mute">
                      {o.email}
                      {o.groupId && <span> · in another group</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => toggleMember(o.uid, true)}>
                    <UserPlus className="h-3.5 w-3.5" /> Add
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* Tasks */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="eyebrow">Tasks</h2>
          <Button onClick={() => setShowTask((v) => !v)}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        </div>

        {showTask && (
          <form onSubmit={createTask} className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Title *">
              <Input
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Build the signup flow"
              />
            </Field>
            <Field label="Assigned to">
              <Select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              >
                <option value="all">All group members</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>{m.displayName}</option>
                ))}
              </Select>
            </Field>
            <Field label="GitHub repo (owner/name)" hint={group.githubRepo ? `Default: ${group.githubRepo}` : undefined}>
              <Input
                value={taskForm.repo}
                onChange={(e) => setTaskForm({ ...taskForm, repo: e.target.value })}
                placeholder="onji-labs/intern-starter"
              />
            </Field>
            <Field label="Branch (optional)">
              <Input
                value={taskForm.branch}
                onChange={(e) => setTaskForm({ ...taskForm, branch: e.target.value })}
                placeholder="main"
              />
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea
                  rows={4}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="What should they build? Acceptance criteria."
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowTask(false)}>Cancel</Button>
              <Button type="submit" loading={busy}>Create task</Button>
            </div>
          </form>
        )}

        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-ink-mute">No tasks yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {tasks.map((t) => (
              <li key={t.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{t.title}</span>
                  {t.assignedTo ? (
                    <Chip>
                      {members.find((m) => m.uid === t.assignedTo)?.displayName || "assigned"}
                    </Chip>
                  ) : (
                    <Chip tone="brand">Group-wide</Chip>
                  )}
                  {t.repo && (
                    <Chip>
                      <Github className="h-3 w-3" /> {t.repo}
                    </Chip>
                  )}
                  {t.dueDate && (
                    <Chip tone="warn">
                      <Clock className="h-3 w-3" /> Due {t.dueDate.toDate().toLocaleDateString()}
                    </Chip>
                  )}
                </div>
                {t.description && (
                  <p className="mt-1 text-sm text-ink-mute">{t.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
