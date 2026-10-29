"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { Bell } from "lucide-react";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  publishedAt?: Timestamp;
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(firebaseDb(), "announcements"), orderBy("publishedAt", "desc")),
        );
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Announcement, "id">),
        }));
        // pinned first
        list.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
        setItems(list);
      } catch (ex) {
        try {
          const snap = await getDocs(collection(firebaseDb(), "announcements"));
          setItems(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Announcement, "id">),
            })),
          );
        } catch {
          setErr(ex instanceof Error ? ex.message : "Failed to load");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        eyebrow="Announcements"
        title="Program announcements"
        description="Program-wide updates from the ONJI team."
      />
      {err && <Banner tone="error">{err}</Banner>}
      {loading ? (
        <LoadingPanel />
      ) : items.length === 0 ? (
        <Empty icon={Bell} title="No announcements yet" description="Pinned updates will appear here." />
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {a.title}
                    </h3>
                    {a.pinned && <Chip tone="brand">Pinned</Chip>}
                  </div>
                  <p className="mt-2 max-w-3xl text-sm text-ink-mute">{a.body}</p>
                </div>
                {a.publishedAt && (
                  <span className="shrink-0 text-xs text-ink-mute">
                    {a.publishedAt.toDate().toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
