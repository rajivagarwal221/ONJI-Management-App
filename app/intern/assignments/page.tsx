"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { ClipboardCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
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
  Textarea,
} from "@/components/ui";

type Assignment = {
  id: string;
  title: string;
  track: string;
  week: number;
  due?: Timestamp;
  isCapstone?: boolean;
  description?: string;
};

type Submission = {
  id: string;
  assignmentId: string;
  status: "pending" | "accepted" | "needs_revisions";
};

export default function AssignmentsPage() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"weekly" | "capstones">("weekly");
  const [open, setOpen] = useState<Assignment | null>(null);

  async function load() {
    if (!user) return;
    try {
      const [aSnap, sSnap] = await Promise.all([
        getDocs(collection(firebaseDb(), "assignments")),
        getDocs(
          query(
            collection(firebaseDb(), "submissions"),
            where("userId", "==", user.uid),
          ),
        ),
      ]);
      setAssignments(
        aSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Assignment, "id">) })),
      );
      setSubmissions(
        sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) })),
      );
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("mode") === "capstones") setMode("capstones");
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const myTracks = (profile as unknown as { tracks?: string[] } | null)?.tracks || [];
  const filtered = assignments
    .filter((a) =>
      mode === "capstones" ? Boolean(a.isCapstone) : !a.isCapstone,
    )
    .filter((a) => myTracks.length === 0 || myTracks.includes(a.track))
    .sort((a, b) => a.week - b.week || a.title.localeCompare(b.title));

  function statusFor(a: Assignment) {
    const s = submissions.find((x) => x.assignmentId === a.id);
    return s?.status;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        eyebrow="Assignments"
        title={mode === "capstones" ? "Capstones" : "Weekly assignments"}
        description={
          mode === "capstones"
            ? "Your final artifact for each track. Submit when ready."
            : "Pick a Week 1 assignment to start, submit when ready. Mentors review within 5 business days."
        }
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "weekly" ? "primary" : "secondary"}
              onClick={() => setMode("weekly")}
            >
              Weekly
            </Button>
            <Button
              size="sm"
              variant={mode === "capstones" ? "primary" : "secondary"}
              onClick={() => setMode("capstones")}
            >
              Capstones
            </Button>
          </div>
        }
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : filtered.length === 0 ? (
        <Empty
          icon={ClipboardCheck}
          title={mode === "capstones" ? "No capstones published yet" : "No assignments yet"}
          description="Ask admin to seed starter content from the admin console."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {filtered.map((a) => {
              const status = statusFor(a);
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-ink-mute">{a.id}</span>
                      <Chip>Week {a.week}</Chip>
                      <Chip tone="brand">{a.track}</Chip>
                      {a.isCapstone && <Chip tone="warn">Capstone</Chip>}
                      {status === "accepted" && <Chip tone="success">Accepted</Chip>}
                      {status === "pending" && <Chip tone="brand">Pending review</Chip>}
                      {status === "needs_revisions" && (
                        <Chip tone="warn">Needs revisions</Chip>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">{a.title}</div>
                    {a.due && (
                      <div className="mt-0.5 text-xs text-ink-mute">
                        Due {a.due.toDate().toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setOpen(a)}>
                      {status ? "Resubmit" : "Submit"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {open && (
        <SubmitDialog
          assignment={open}
          onClose={() => setOpen(null)}
          onSubmitted={async () => {
            setOpen(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function SubmitDialog({
  assignment,
  onClose,
  onSubmitted,
}: {
  assignment: Assignment;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      await addDoc(collection(firebaseDb(), "submissions"), {
        userId: user.uid,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        track: assignment.track,
        link,
        notes,
        status: "pending",
        submittedAt: serverTimestamp(),
      });
      onSubmitted();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line-strong bg-paper-elev p-6 shadow-xl">
        <h2 className="font-display text-xl font-semibold text-ink">Submit: {assignment.title}</h2>
        <p className="mt-1 text-xs text-ink-mute">{assignment.id} · {assignment.track} · Week {assignment.week}</p>
        {assignment.description && (
          <p className="mt-3 text-sm text-ink-mute">{assignment.description}</p>
        )}
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <Field label="Submission link" hint="GitHub repo, Google Doc, Loom, etc.">
            <Input
              required
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://github.com/you/your-repo"
            />
          </Field>
          <Field label="Notes (optional)">
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the reviewer should know."
            />
          </Field>
          {err && <Banner tone="error">{err}</Banner>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={busy}>Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
