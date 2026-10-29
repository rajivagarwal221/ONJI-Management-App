"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Card,
  Chip,
  Empty,
  LoadingPanel,
  PageHeader,
  Progress,
} from "@/components/ui";

type Track = { id: string; name: string; requiredAssignments: number };
type Assignment = { id: string; track: string; isCapstone?: boolean };
type Submission = {
  id: string;
  assignmentId: string;
  track: string;
  status: "pending" | "accepted" | "needs_revisions";
};

export default function CompletionPage() {
  const { user, profile } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [onbDone, setOnbDone] = useState({ done: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [tSnap, aSnap, sSnap, oSnap] = await Promise.all([
          getDocs(query(collection(firebaseDb(), "tracks"), orderBy("order"))),
          getDocs(collection(firebaseDb(), "assignments")),
          getDocs(
            query(
              collection(firebaseDb(), "submissions"),
              where("userId", "==", user.uid),
            ),
          ),
          getDocs(collection(firebaseDb(), "users", user.uid, "onboarding")),
        ]);
        setTracks(tSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Track, "id">) })));
        setAssignments(
          aSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Assignment, "id">) })),
        );
        setSubmissions(
          sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) })),
        );
        setOnbDone({
          done: oSnap.docs.filter((d) => (d.data() as { done?: boolean }).done).length,
          total: oSnap.size,
        });
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const enrolled = (profile as unknown as { tracks?: string[] } | null)?.tracks || [];
  const myTracks = tracks.filter((t) => enrolled.includes(t.id));

  function qualifiedFor(trackId: string, required: number) {
    const accepted = submissions.filter(
      (s) => s.track === trackId && s.status === "accepted",
    ).length;
    const capstone = submissions.find((s) => {
      const a = assignments.find((x) => x.id === s.assignmentId);
      return a?.isCapstone && s.track === trackId && s.status === "accepted";
    });
    return { accepted, capstone: !!capstone, qualified: accepted >= required && !!capstone };
  }

  const qualifiedCount = myTracks.filter((t) => {
    const q = qualifiedFor(t.id, t.requiredAssignments);
    return q.qualified;
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Completion"
        title="Certificate requirements"
        description="Each track certificate requires five accepted assignments plus an accepted capstone in that track."
        action={<Chip tone="brand">{qualifiedCount}/{myTracks.length} qualified</Chip>}
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : myTracks.length === 0 ? (
        <Empty
          icon={GraduationCap}
          title="Not enrolled in any tracks yet"
          description="Ask admin to enroll you (or seed starter content)."
        />
      ) : (
        <Card>
          <div className="grid gap-5">
            {myTracks.map((t) => {
              const q = qualifiedFor(t.id, t.requiredAssignments);
              const pct =
                (q.accepted / t.requiredAssignments) * 50 + (q.capstone ? 50 : 0);
              return (
                <div key={t.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-ink">{t.name}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-ink-mute">
                        {q.accepted}/{t.requiredAssignments} assignments
                      </span>
                      <span className="text-ink-mute">·</span>
                      <span className="text-ink-mute">
                        capstone {q.capstone ? "accepted" : "not accepted"}
                      </span>
                      <Chip tone={q.qualified ? "success" : "neutral"}>
                        {q.qualified ? "Qualified" : "In progress"}
                      </Chip>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={pct} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-ink-mute">
            Onboarding: {onbDone.done}/{onbDone.total} complete. Does not block certificate eligibility.
          </p>
        </Card>
      )}
    </div>
  );
}
