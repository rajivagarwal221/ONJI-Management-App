import { Button, Card, Chip, PageHeader } from "@/components/ui";

const questions = [
  {
    id: "q-01",
    title: "Can I use PyTorch for the Week 3 modeling assignment?",
    track: "Machine Learning",
    status: "Answered",
    updated: "yesterday",
  },
  {
    id: "q-02",
    title: "Does the capstone need a hosted demo or is a repo fine?",
    track: "Machine Learning",
    status: "Open",
    updated: "2 days ago",
  },
];

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Questions"
        title="Your questions"
        description="Private thread with a mentor. Public Q&A lives inside each assignment."
        action={<Button>Ask a question</Button>}
      />

      <div className="grid gap-3">
        {questions.map((q) => (
          <Card key={q.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-ink">{q.title}</h3>
                <p className="mt-1 text-sm text-ink-mute">
                  {q.track} · updated {q.updated}
                </p>
              </div>
              <Chip tone={q.status === "Answered" ? "success" : "brand"}>{q.status}</Chip>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
