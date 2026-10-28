import { Button, Card, Chip, PageHeader } from "@/components/ui";

const courses = [
  {
    id: "fundamentals",
    title: "Anthropic Fundamentals",
    hours: 4,
    progress: 0,
    status: "Not started",
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering with Claude",
    hours: 6,
    progress: 0,
    status: "Not started",
  },
  {
    id: "tool-use",
    title: "Tool Use & Agents",
    hours: 8,
    progress: 0,
    status: "Not started",
  },
  {
    id: "safety",
    title: "AI Safety for Builders",
    hours: 3,
    progress: 0,
    status: "Not started",
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Anthropic Certs"
        title="Anthropic certifications"
        description="Short, free courses from Anthropic. Finishing one adds a verifiable certificate to your profile."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{c.title}</h2>
                <p className="mt-1 text-sm text-ink-mute">~{c.hours} hours · self-paced</p>
              </div>
              <Chip>{c.status}</Chip>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-soft">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${c.progress}%` }}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button href={`/intern/courses/${c.id}`}>Start course</Button>
              <Button variant="ghost" href={`/intern/courses/${c.id}/syllabus`}>
                View syllabus
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
