import { Button, Card, Chip, PageHeader } from "@/components/ui";

type Submission = {
  id: string;
  assignment: string;
  track: string;
  submitted: string;
  reviewer?: string;
  status: "Pending" | "Accepted" | "Needs revisions";
};

const submissions: Submission[] = [
  {
    id: "s-01",
    assignment: "A-AIF-W1-01 · Prompt the same task three ways",
    track: "AI Fluency",
    submitted: "Oct 25",
    reviewer: "Priya Shah",
    status: "Accepted",
  },
  {
    id: "s-02",
    assignment: "A-ML-W1-03 · Write a data-leak postmortem",
    track: "Machine Learning",
    submitted: "Oct 27",
    status: "Pending",
  },
];

function tone(s: Submission["status"]) {
  if (s === "Accepted") return "success" as const;
  if (s === "Pending") return "brand" as const;
  return "warn" as const;
}

export default function SubmissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Submissions"
        title="Your submissions"
        description="A record of everything you've submitted. Only accepted work counts toward track certificates."
        action={<Button href="/intern/assignments">Open assignments</Button>}
      />

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_120px_140px_140px] gap-3 border-b border-line bg-paper-soft px-5 py-3 text-xs uppercase tracking-wide text-ink-mute">
          <span>Assignment</span>
          <span>Track</span>
          <span>Submitted</span>
          <span>Reviewer</span>
          <span>Status</span>
        </div>
        <ul className="divide-y divide-line">
          {submissions.map((s) => (
            <li
              key={s.id}
              className="grid grid-cols-[1fr_140px_120px_140px_140px] items-center gap-3 px-5 py-3 text-sm"
            >
              <span className="truncate text-ink">{s.assignment}</span>
              <span className="text-ink-mute">{s.track}</span>
              <span className="text-ink-mute">{s.submitted}</span>
              <span className="text-ink-mute">{s.reviewer || "—"}</span>
              <Chip tone={tone(s.status)}>{s.status}</Chip>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
