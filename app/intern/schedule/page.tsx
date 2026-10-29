"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Assignment = {
  id: string;
  title: string;
  track: string;
  week: number;
};

export default function SchedulePage() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const primary = (profile as unknown as { primaryTrack?: string } | null)?.primaryTrack || "ml";

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(firebaseDb(), "assignments"), where("track", "==", primary)),
        );
        setAssignments(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Assignment, "id">) })),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [primary]);

  const byWeek = assignments.reduce<Record<number, Assignment[]>>((acc, a) => {
    (acc[a.week] ||= []).push(a);
    return acc;
  }, {});
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        eyebrow="Schedule"
        title="Program schedule"
        description="Suggested week-by-week plan for your primary track. Everything is self-paced."
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : weeks.length === 0 ? (
        <Empty
          icon={CalendarDays}
          title="No schedule yet"
          description="Ask admin to seed starter content."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {weeks.map((w) => (
            <Card key={w}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink">Week {w}</h2>
                {w === 1 && <Chip tone="brand">Now</Chip>}
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {byWeek[w].map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-line bg-paper-soft px-3 py-2 text-ink"
                  >
                    {a.title}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
