"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { Briefcase, Check, X } from "lucide-react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Chip,
  Empty,
  Field,
  LoadingPanel,
  PageHeader,
  Textarea,
} from "@/components/ui";

type Submission = {
  id: string;
  userId: string;
  assignmentId: string;
  assignmentTitle: string;
  track: string;
  link: string;
  notes?: string;
  status: "pending" | "accepted" | "needs_revisions";
  reviewer?: string;
  reviewerNote?: string;
  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;
};

type UserLite = { uid: string; displayName?: string; referenceNo?: string };

export default function AdminSubmissionsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [users, setUsers] = useState<Record<string, UserLite>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all" | "accepted" | "needs_revisions">("pending");
  const [open, setOpen] = useState<Submission | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    try {
      let q = query(
        collection(firebaseDb(), "submissions"),
        orderBy("submittedAt", "desc"),
      );
      if (filter !== "all") {
        q = query(
          collection(firebaseDb(), "submissions"),
          where("status", "==", filter),
          orderBy("submittedAt", "desc"),
        );
      }
      let docs;
      try {
        docs = (await getDocs(q)).docs;
      } catch {
        // Fallback if the compound index isn't built yet
        const base = await getDocs(collection(firebaseDb(), "submissions"));
        docs = base.docs;
      }
      const list = docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Submission, "id">),
      }));
      const filtered =
        filter === "all" ? list : list.filter((s) => s.status === filter);
      setSubs(filtered);

      // Resolve usernames for each submission
      const needed = Array.from(new Set(filtered.map((s) => s.userId))).filter(
        (uid) => !users[uid],
      );
      if (needed.length) {
        const map: Record<string, UserLite> = { ...users };
        for (const uid of needed) {
          try {
            const uSnap = await getDocs(
              query(collection(firebaseDb(), "users"), where("uid", "==", uid)),
            );
            uSnap.forEach((d) => {
              map[uid] = { uid, ...(d.data() as Omit<UserLite, "uid">) };
            });
          } catch {}
        }
        setUsers(map);
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function review(
    s: Submission,
    status: "accepted" | "needs_revisions",
    note: string,
  ) {
    setBusy(true);
    setMsg(null);
    try {
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const res = await fetch("/api/admin/review-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken || ""}`,
        },
        body: JSON.stringify({ submissionId: s.id, status, reviewerNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(
        status === "accepted"
          ? "Marked as accepted."
          : "Sent back for revisions.",
      );
      setOpen(null);
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const filters = [
    { key: "pending" as const, label: "Pending", tone: "brand" as const },
    { key: "accepted" as const, label: "Accepted", tone: "success" as const },
    { key: "needs_revisions" as const, label: "Needs revisions", tone: "warn" as const },
    { key: "all" as const, label: "All", tone: "neutral" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        eyebrow="Submissions"
        title="Review queue"
        description="Grade intern work. Accepted submissions count toward track certificates."
      />

      {msg && <Banner tone="success">{msg}</Banner>}
      {err && <Banner tone="error">{err}</Banner>}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "primary" : "secondary"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingPanel />
      ) : subs.length === 0 ? (
        <Empty
          icon={Briefcase}
          title={`No ${filter === "all" ? "" : filter.replace("_", " ")} submissions`}
          description="New submissions will appear here as interns submit."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {subs.map((s) => {
              const u = users[s.userId];
              const toneMap = {
                pending: "brand" as const,
                accepted: "success" as const,
                needs_revisions: "warn" as const,
              };
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{s.assignmentTitle}</span>
                      <Chip tone={toneMap[s.status]}>
                        {s.status === "needs_revisions"
                          ? "Needs revisions"
                          : s.status[0].toUpperCase() + s.status.slice(1)}
                      </Chip>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
                      <span>{u?.displayName || "—"}</span>
                      {u?.referenceNo && <span className="font-mono">· {u.referenceNo}</span>}
                      <span>· {s.track}</span>
                      {s.submittedAt && (
                        <span>· submitted {s.submittedAt.toDate().toLocaleDateString()}</span>
                      )}
                    </div>
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block truncate text-xs text-brand hover:underline"
                      >
                        {s.link}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setOpen(s)}>
                      Review
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {open && (
        <ReviewDialog
          submission={open}
          onClose={() => setOpen(null)}
          onReview={(status, note) => review(open, status, note)}
          busy={busy}
        />
      )}
    </div>
  );
}

function ReviewDialog({
  submission,
  onClose,
  onReview,
  busy,
}: {
  submission: Submission;
  onClose: () => void;
  onReview: (status: "accepted" | "needs_revisions", note: string) => void;
  busy: boolean;
}) {
  const [note, setNote] = useState(submission.reviewerNote || "");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-line-strong bg-paper-elev p-6 shadow-xl">
        <h2 className="font-display text-xl font-semibold text-ink">
          Review submission
        </h2>
        <p className="mt-1 text-sm text-ink-mute">
          {submission.assignmentTitle} · {submission.track}
        </p>

        <div className="mt-4 grid gap-4">
          <div>
            <div className="eyebrow">Submission link</div>
            <a
              href={submission.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-brand hover:underline break-all"
            >
              {submission.link}
            </a>
          </div>
          {submission.notes && (
            <div>
              <div className="eyebrow">Intern notes</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{submission.notes}</p>
            </div>
          )}
          <Field label="Reviewer note (shared with intern)">
            <Textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's great, what to fix, what to try next."
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={() => onReview("needs_revisions", note)}
          >
            <X className="h-4 w-4" /> Request revisions
          </Button>
          <Button loading={busy} onClick={() => onReview("accepted", note)}>
            <Check className="h-4 w-4" /> Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
