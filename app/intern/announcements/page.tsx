import { Card, Chip, PageHeader } from "@/components/ui";

const announcements = [
  {
    id: "a-01",
    title: "Capstone review windows for July 2026 cohort",
    body: "Capstones submitted before Dec 10 get first-round review within 5 business days.",
    date: "Oct 24",
    pinned: true,
  },
  {
    id: "a-02",
    title: "New ML resource: time-series starter",
    body: "Added a time-series starter repo under Week 3 resources.",
    date: "Oct 20",
  },
  {
    id: "a-03",
    title: "Office hours moved to Thursdays",
    body: "Mentor office hours now Thu 18:00 UTC. Recordings in the Events tab.",
    date: "Oct 18",
  },
];

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Announcements"
        title="Program announcements"
        description="Program-wide updates from the ONJI team. Pinned items stay at the top."
      />
      <div className="grid gap-3">
        {announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-ink">{a.title}</h3>
                  {a.pinned && <Chip tone="brand">Pinned</Chip>}
                </div>
                <p className="mt-2 max-w-3xl text-sm text-ink-mute">{a.body}</p>
              </div>
              <span className="shrink-0 text-xs text-ink-mute">{a.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
