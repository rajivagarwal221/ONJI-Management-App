import { Card, Chip, PageHeader } from "@/components/ui";

const weeks = [
  { week: 1, label: "Week 1 · Current", theme: "Foundations", assignments: 5 },
  { week: 2, label: "Week 2", theme: "Data & evaluation", assignments: 5 },
  { week: 3, label: "Week 3", theme: "Modeling", assignments: 5 },
  { week: 4, label: "Week 4", theme: "Deployment", assignments: 5 },
  { week: 5, label: "Week 5", theme: "Iteration", assignments: 5 },
  { week: 6, label: "Week 6", theme: "Capstone", assignments: 1 },
];

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedule"
        title="Program schedule"
        description="A rough path through your primary track. Everything is self-paced — this is suggested cadence."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {weeks.map((w) => (
          <Card key={w.week}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{w.label}</h2>
              {w.week === 1 && <Chip tone="brand">Now</Chip>}
            </div>
            <p className="mt-1 text-sm text-ink-mute">{w.theme}</p>
            <p className="mt-4 text-sm text-ink-mute">
              <span className="font-medium text-ink">{w.assignments}</span> assignments ·{" "}
              Suggested effort 6–8h
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
