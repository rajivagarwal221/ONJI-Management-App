"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { Clock, GitCommit, Github, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { parseGithubHandle } from "@/lib/github";
import {
  Banner,
  Button,
  Card,
  Chip,
  Empty,
  LoadingPanel,
  PageHeader,
} from "@/components/ui";

type Group = {
  id: string;
  name: string;
  githubOrg?: string | null;
  githubRepo?: string | null;
};
type Task = {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string | null;
  repo?: string | null;
  branch?: string | null;
  dueDate?: Timestamp | null;
  createdAt?: Timestamp | null;
};
type Commit = {
  sha: string;
  message: string;
  html_url: string;
  author?: string;
  authored_at?: string;
};

export default function InternTasksPage() {
  const { user, profile } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commits, setCommits] = useState<Record<string, Commit[]>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ghErr, setGhErr] = useState<string | null>(null);

  const groupId = (profile as unknown as { groupId?: string } | null)?.groupId;
  const githubUrl = (profile as unknown as { github?: string } | null)?.github;
  const handle = parseGithubHandle(githubUrl);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (!groupId) {
          setLoading(false);
          return;
        }
        const [gSnap, tSnap] = await Promise.all([
          getDoc(doc(firebaseDb(), "groups", groupId)),
          getDocs(
            query(
              collection(firebaseDb(), "tasks"),
              where("groupId", "==", groupId),
            ),
          ),
        ]);
        if (gSnap.exists()) {
          setGroup({ id: gSnap.id, ...(gSnap.data() as Omit<Group, "id">) });
        }
        const t = tSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Task, "id">),
        }));
        // Only tasks assigned to me OR group-wide (null assignee)
        const mine = t.filter((x) => !x.assignedTo || x.assignedTo === user.uid);
        mine.sort((a, b) => {
          const ad = a.dueDate?.toMillis() || Infinity;
          const bd = b.dueDate?.toMillis() || Infinity;
          return ad - bd;
        });
        setTasks(mine);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, groupId]);

  async function fetchCommits(task: Task) {
    if (!handle || !task.repo) return;
    try {
      setGhErr(null);
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const since = task.createdAt
        ? task.createdAt.toDate().toISOString()
        : "";
      const qs = new URLSearchParams({
        repo: task.repo,
        author: handle,
      });
      if (since) qs.set("since", since);
      const res = await fetch(`/api/github/commits?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${idToken || ""}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setGhErr(`${task.repo}: ${data.error || "GitHub error"}`);
        return;
      }
      setCommits((c) => ({ ...c, [task.id]: data.commits as Commit[] }));
    } catch (ex) {
      setGhErr(ex instanceof Error ? ex.message : "GitHub fetch failed");
    }
  }

  // Auto-fetch commits for the first few tasks once we know the handle
  useEffect(() => {
    if (!handle) return;
    tasks.slice(0, 5).forEach((t) => {
      if (t.repo && !commits[t.id]) void fetchCommits(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, tasks]);

  if (!groupId) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Target}
          eyebrow="Tasks"
          title="Group tasks"
          description="Shared tasks from your group and the commits you've made against them."
        />
        <Empty
          icon={Target}
          title="You're not in a group yet"
          description="Ask your admin to assign you to a group from the admin console."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Target}
        eyebrow="Tasks"
        title={group ? group.name : "Group tasks"}
        description={
          group?.githubOrg
            ? `GitHub: github.com/${group.githubOrg}`
            : "Tasks assigned to you by your group."
        }
      />

      {err && <Banner tone="error">{err}</Banner>}
      {ghErr && <Banner tone="error">{ghErr}</Banner>}

      {!handle && (
        <Banner tone="info">
          Add your GitHub profile URL on your{" "}
          <a href="/intern/profile" className="font-medium underline">profile</a>{" "}
          so we can show your commits against each task.
        </Banner>
      )}

      {loading ? (
        <LoadingPanel />
      ) : tasks.length === 0 ? (
        <Empty icon={Target} title="No tasks yet" description="Your group doesn't have any tasks assigned to you right now." />
      ) : (
        <div className="grid gap-4">
          {tasks.map((t) => {
            const taskCommits = commits[t.id] || [];
            return (
              <Card key={t.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {t.title}
                  </h2>
                  {!t.assignedTo && <Chip tone="brand">Group-wide</Chip>}
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
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-mute">{t.description}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="eyebrow">Your commits</h3>
                    {t.repo && handle && (
                      <Button size="sm" variant="ghost" onClick={() => void fetchCommits(t)}>
                        Refresh
                      </Button>
                    )}
                  </div>

                  {!t.repo ? (
                    <p className="mt-2 text-sm text-ink-mute">No repo linked to this task.</p>
                  ) : !handle ? (
                    <p className="mt-2 text-sm text-ink-mute">Add your GitHub profile to see commits.</p>
                  ) : taskCommits.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-mute">
                      No commits found by <code>{handle}</code> on <code>{t.repo}</code>
                      {t.createdAt && (
                        <> since {t.createdAt.toDate().toLocaleDateString()}</>
                      )}
                      .
                    </p>
                  ) : (
                    <ul className="mt-2 divide-y divide-line">
                      {taskCommits.map((c) => (
                        <li key={c.sha} className="flex items-start gap-3 py-2">
                          <GitCommit className="mt-0.5 h-4 w-4 text-ink-mute shrink-0" />
                          <div className="min-w-0 flex-1">
                            <a
                              href={c.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-sm text-ink hover:text-brand hover:underline"
                            >
                              {c.message}
                            </a>
                            <div className="mt-0.5 text-xs text-ink-mute">
                              {c.sha.slice(0, 7)}
                              {c.authored_at &&
                                ` · ${new Date(c.authored_at).toLocaleString()}`}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
