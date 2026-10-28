import { Button, Card, Chip, PageHeader } from "@/components/ui";

type Resource = {
  id: string;
  title: string;
  track: "AI Fluency" | "Machine Learning" | "Both";
  week: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  href?: string;
  locked?: boolean;
};

const resources: Resource[] = [
  { id: "r-01", title: "ONJI ML Internship Starter (GitHub)", track: "Machine Learning", week: 1, level: "Beginner", locked: true },
  { id: "r-02", title: "How Google Search Works", track: "Both", week: 1, level: "Beginner", href: "/intern/resources/r-02" },
  { id: "r-03", title: "AI Features and Your Website", track: "Both", week: 1, level: "Intermediate", href: "/intern/resources/r-03" },
  { id: "r-04", title: "Debug Search Traffic Drops", track: "Both", week: 1, level: "Intermediate", href: "/intern/resources/r-04" },
  { id: "r-05", title: "The ML Loop: data → model → metric", track: "Machine Learning", week: 2, level: "Beginner", href: "/intern/resources/r-05" },
  { id: "r-06", title: "Prompting patterns that actually work", track: "AI Fluency", week: 1, level: "Beginner", href: "/intern/resources/r-06" },
  { id: "r-07", title: "Fairness & evaluation for classifiers", track: "Machine Learning", week: 3, level: "Advanced", href: "/intern/resources/r-07" },
  { id: "r-08", title: "RAG without tears", track: "AI Fluency", week: 3, level: "Intermediate", href: "/intern/resources/r-08" },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resources"
        title="Resource library"
        description="Hand-picked reading, videos, and starter repos. Filter by track and week on your dashboard."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="brand">Week {r.week}</Chip>
              <Chip>{r.level}</Chip>
              <Chip>{r.track}</Chip>
              {r.locked && <Chip tone="warn">Locked</Chip>}
            </div>
            <h3 className="mt-3 font-medium text-ink">{r.title}</h3>
            {r.href && !r.locked ? (
              <Button size="sm" variant="secondary" href={r.href} className="mt-4">
                Open resource
              </Button>
            ) : (
              <p className="mt-4 text-xs text-ink-mute">
                Unlocks once you reach Week {r.week}.
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
