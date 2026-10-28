import { Button, Card, PageHeader } from "@/components/ui";

const notes = [
  {
    id: "n-01",
    title: "Train-test split pitfalls",
    excerpt:
      "Random split leaks future info when you have time-based features. Use time-based split for anything with a timestamp.",
    updated: "2 days ago",
  },
  {
    id: "n-02",
    title: "Prompt skeleton I keep reusing",
    excerpt:
      "Role → context → examples → task → constraints → output format. Stops me from forgetting constraints.",
    updated: "5 days ago",
  },
  {
    id: "n-03",
    title: "Why accuracy is a bad default",
    excerpt:
      "On imbalanced data a dumb classifier can score 95%. Use precision/recall + a confusion matrix.",
    updated: "last week",
  },
];

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Study notes"
        title="Your notes"
        description="Private notes attached to your account. Not shared with mentors unless you quote them in a submission."
        action={<Button>New note</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((n) => (
          <Card key={n.id}>
            <h3 className="font-display text-lg font-semibold text-ink">{n.title}</h3>
            <p className="mt-2 text-sm text-ink-mute">{n.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink-mute">Updated {n.updated}</span>
              <Button size="sm" variant="secondary" href={`/intern/notes/${n.id}`}>
                Open
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
