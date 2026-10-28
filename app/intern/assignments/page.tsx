import { Button, Card, Chip, PageHeader } from "@/components/ui";

type Assignment = {
  id: string;
  title: string;
  track: "AI Fluency" | "Machine Learning";
  week: number;
  due: string;
  status: "Not started" | "In progress" | "Submitted" | "Accepted" | "Needs revisions";
};

const assignments: Assignment[] = [
  { id: "A-ML-W1-01", title: "Train your first classifier", track: "Machine Learning", week: 1, due: "Nov 03", status: "Not started" },
  { id: "A-ML-W1-02", title: "Evaluate with the right metric", track: "Machine Learning", week: 1, due: "Nov 03", status: "Not started" },
  { id: "A-ML-W1-03", title: "Write a data-leak postmortem", track: "Machine Learning", week: 1, due: "Nov 05", status: "In progress" },
  { id: "A-AIF-W1-01", title: "Prompt the same task three ways", track: "AI Fluency", week: 1, due: "Nov 02", status: "Submitted" },
  { id: "A-AIF-W1-02", title: "Fact-check an LLM answer", track: "AI Fluency", week: 1, due: "Nov 04", status: "Not started" },
  { id: "A-ML-W2-01", title: "Clean a messy dataset", track: "Machine Learning", week: 2, due: "Nov 10", status: "Not started" },
];

function statusTone(s: Assignment["status"]) {
  if (s === "Accepted") return "success" as const;
  if (s === "Submitted") return "brand" as const;
  if (s === "In progress") return "warn" as const;
  if (s === "Needs revisions") return "warn" as const;
  return "neutral" as const;
}

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assignments"
        title="Weekly assignments"
        description="Submit assignments against your track. Capstones live in their own tab."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" href="/intern/assignments?mode=capstones">
              Capstones
            </Button>
            <Button href="/intern/assignments/new">New submission</Button>
          </div>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_120px_110px_140px] items-center gap-3 border-b border-line bg-paper-soft px-5 py-3 text-xs uppercase tracking-wide text-ink-mute">
          <span>Title</span>
          <span>Track</span>
          <span>Week</span>
          <span>Due</span>
          <span>Status</span>
        </div>
        <ul className="divide-y divide-line">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-[1fr_140px_120px_110px_140px] items-center gap-3 px-5 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-ink">{a.title}</div>
                <div className="truncate text-xs text-ink-mute">{a.id}</div>
              </div>
              <span className="text-ink-mute">{a.track}</span>
              <span className="text-ink-mute">Week {a.week}</span>
              <span className="text-ink-mute">{a.due}</span>
              <Chip tone={statusTone(a.status)}>{a.status}</Chip>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
