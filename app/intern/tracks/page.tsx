import { Button, Card, Chip, PageHeader } from "@/components/ui";

const tracks = [
  {
    key: "fluency",
    name: "AI Fluency",
    enrolled: true,
    primary: false,
    completed: 0,
    total: 5,
    capstone: "Not submitted",
    summary:
      "The foundation. Understand how modern AI systems work, where they fail, and how to use them well in day-to-day work.",
  },
  {
    key: "ml",
    name: "Machine Learning",
    enrolled: true,
    primary: true,
    completed: 0,
    total: 5,
    capstone: "Not submitted",
    summary:
      "Build and evaluate ML systems end-to-end: data, modeling, deployment, and iteration against real metrics.",
  },
  {
    key: "ai-eng",
    name: "AI Engineering",
    enrolled: false,
    primary: false,
    completed: 0,
    total: 5,
    capstone: "—",
    summary: "Ship LLM-powered products: evals, retrieval, tools, agents, and production hygiene.",
  },
];

export default function TracksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tracks"
        title="Program tracks"
        description="Each track is independent. Finish five assignments plus an accepted capstone to earn its certificate."
      />

      <div className="grid gap-4">
        {tracks.map((t) => (
          <Card key={t.key}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink">{t.name}</h2>
                  {t.primary && <Chip tone="brand">Primary</Chip>}
                  {t.enrolled ? <Chip tone="success">Enrolled</Chip> : <Chip>Not enrolled</Chip>}
                </div>
                <p className="mt-2 max-w-2xl text-sm text-ink-mute">{t.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span className="text-ink-mute">
                    Assignments:{" "}
                    <span className="font-medium text-ink">
                      {t.completed}/{t.total}
                    </span>
                  </span>
                  <span className="text-ink-mute">
                    Capstone: <span className="font-medium text-ink">{t.capstone}</span>
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {t.enrolled ? (
                  <>
                    <Button href={`/intern/tracks/${t.key}`}>Open track</Button>
                    <Button variant="secondary" href={`/intern/assignments?track=${t.key}`}>
                      Assignments
                    </Button>
                  </>
                ) : (
                  <Button href={`/intern/tracks/${t.key}/enroll`}>Enroll</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
