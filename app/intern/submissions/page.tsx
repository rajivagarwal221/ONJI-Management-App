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
import { Briefcase } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Submission = {
  id: string;
  assignmentTitle: string;
  track: string;
  link: string;
  status: "pending" | "accepted" | "needs_revisions";
  submittedAt?: Timestamp;
  reviewer?: string;
};

function tone(s: Submission["status"]) {
  if (s === "accepted") return "success" as const;
  if (s === "pending") return "brand" as const;
  return "warn" as const;
}

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(firebaseDb(), "submissions"),
            where("userId", "==", user.uid),
            orderBy("submittedAt", "desc"),
          ),
        );
        setSubs(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) })),
        );
      } catch (ex) {
        try {
          // index may be building — fall back to unsorted
          const snap = await getDocs(
            query(
              collection(firebaseDb(), "submissions"),
              where("userId", "==", user.uid),
            ),
          );
          setSubs(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) })),
          );
        } catch {
          setErr(ex instanceof Error ? ex.message : "Failed to load");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        eyebrow="Submissions"
        title="Your submissions"
        description="Only accepted work counts toward track certificates."
        action={<Button href="/intern/assignments">Open assignments</Button>}
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : subs.length === 0 ? (
        <Empty
          icon={Briefcase}
          title="No submissions yet"
          description="Submit your first assignment from the Assignments page."
          action={<Button href="/intern/assignments">Browse assignments</Button>}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {subs.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">
                    {s.assignmentTitle}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
                    <span>{s.track}</span>
                    {s.submittedAt && (
                      <>
                        <span>·</span>
                        <span>{s.submittedAt.toDate().toLocaleDateString()}</span>
                      </>
                    )}
                    {s.reviewer && (
                      <>
                        <span>·</span>
                        <span>Reviewer: {s.reviewer}</span>
                      </>
                    )}
                  </div>
                  {s.link && (
                    <a
                      href={s.link}
                      className="mt-1 inline-block text-xs text-brand hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.link}
                    </a>
                  )}
                </div>
                <Chip tone={tone(s.status)}>
                  {s.status === "pending"
                    ? "Pending"
                    : s.status === "accepted"
                      ? "Accepted"
                      : "Needs revisions"}
                </Chip>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
