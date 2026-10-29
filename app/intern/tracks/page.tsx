"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Track = {
  id: string;
  name: string;
  summary: string;
  requiredAssignments: number;
  weeks?: number;
};

type Submission = { id: string; track: string; status: string; assignmentId: string };

export default function TracksPage() {
  const { user, profile } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [tSnap, sSnap] = await Promise.all([
          getDocs(query(collection(firebaseDb(), "tracks"), orderBy("order"))),
          getDocs(
            query(
              collection(firebaseDb(), "submissions"),
              where("userId", "==", user.uid),
            ),
          ),
        ]);
        setTracks(tSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Track, "id">) })));
        setSubmissions(
          sSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) })),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const enrolled = (profile as unknown as { tracks?: string[] } | null)?.tracks || [];
  const primary = (profile as unknown as { primaryTrack?: string } | null)?.primaryTrack;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        eyebrow="Tracks"
        title="Program tracks"
        description="Each track is independent. Finish five accepted assignments plus an accepted capstone to earn its certificate."
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : tracks.length === 0 ? (
        <Empty
          icon={BookOpen}
          title="No tracks published yet"
          description="Ask admin to seed starter content from the admin console."
        />
      ) : (
        <div className="grid gap-4">
          {tracks.map((t) => {
            const isEnrolled = enrolled.includes(t.id);
            const isPrimary = primary === t.id;
            const accepted = submissions.filter(
              (s) => s.track === t.id && s.status === "accepted",
            ).length;
            return (
              <Card key={t.id} interactive>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold text-ink">
                        {t.name}
                      </h2>
                      {isPrimary && <Chip tone="brand">Primary</Chip>}
                      {isEnrolled ? (
                        <Chip tone="success">Enrolled</Chip>
                      ) : (
                        <Chip>Not enrolled</Chip>
                      )}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-ink-mute">{t.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span className="text-ink-mute">
                        Progress:{" "}
                        <span className="font-medium text-ink">
                          {accepted}/{t.requiredAssignments} accepted
                        </span>
                      </span>
                      {t.weeks && (
                        <span className="text-ink-mute">
                          Length:{" "}
                          <span className="font-medium text-ink">{t.weeks} weeks</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button href={`/intern/assignments?track=${t.id}`}>
                      Open assignments
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
