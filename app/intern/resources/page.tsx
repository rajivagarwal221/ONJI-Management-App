"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { BookOpen } from "lucide-react";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Resource = {
  id: string;
  title: string;
  track: string;
  week: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  href?: string;
  locked?: boolean;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(firebaseDb(), "resources"));
        setResources(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Resource, "id">) })),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tracks = Array.from(new Set(resources.map((r) => r.track))).sort();
  const filtered = resources
    .filter((r) => filter === "all" || r.track === filter)
    .sort((a, b) => a.week - b.week);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        eyebrow="Resources"
        title="Resource library"
        description="Reading, videos, and starter repos picked for each week of your track."
      />
      {err && <Banner tone="error">{err}</Banner>}

      {resources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "primary" : "secondary"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          {tracks.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={filter === t ? "primary" : "secondary"}
              onClick={() => setFilter(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingPanel />
      ) : filtered.length === 0 ? (
        <Empty
          icon={BookOpen}
          title="No resources yet"
          description="Ask admin to seed starter content from the admin console."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} interactive>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="brand">Week {r.week}</Chip>
                <Chip>{r.level}</Chip>
                <Chip>{r.track}</Chip>
                {r.locked && <Chip tone="warn">Locked</Chip>}
              </div>
              <h3 className="mt-3 font-medium text-ink">{r.title}</h3>
              {r.href && !r.locked ? (
                <Button size="sm" variant="secondary" href={r.href} className="mt-4">
                  Open
                </Button>
              ) : r.locked ? (
                <p className="mt-4 text-xs text-ink-mute">
                  Unlocks once you reach Week {r.week}.
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
