"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { CalendarDays } from "lucide-react";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type EventDoc = {
  id: string;
  title: string;
  startsAt: Timestamp;
  host: string;
  joinUrl?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(firebaseDb(), "events"), orderBy("startsAt", "asc")),
        );
        setEvents(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventDoc, "id">) })),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcoming = events.filter((e) => e.startsAt.toDate().getTime() >= Date.now());
  const past = events.filter((e) => e.startsAt.toDate().getTime() < Date.now());

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        eyebrow="Events"
        title="Upcoming events"
        description="Office hours, guest talks, and live walkthroughs. All optional, all recorded."
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : upcoming.length === 0 && past.length === 0 ? (
        <Empty icon={CalendarDays} title="No events scheduled yet" />
      ) : (
        <>
          <div className="grid gap-3">
            {upcoming.map((e) => (
              <Card key={e.id} interactive>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-mute">
                      {e.startsAt.toDate().toLocaleString()} · hosted by {e.host}
                    </p>
                  </div>
                  {e.joinUrl && <Button href={e.joinUrl}>Join link</Button>}
                </div>
              </Card>
            ))}
          </div>
          {past.length > 0 && (
            <div>
              <h2 className="eyebrow mt-6">Past events</h2>
              <div className="mt-3 grid gap-2">
                {past.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-paper-soft px-4 py-2 text-sm"
                  >
                    <span className="text-ink-mute">
                      {e.startsAt.toDate().toLocaleDateString()} — {e.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
