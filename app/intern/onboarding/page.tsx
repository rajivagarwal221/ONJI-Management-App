import { CheckCircle2 } from "lucide-react";
import { Button, Card, Chip, PageHeader } from "@/components/ui";

const items = [
  { id: 1, title: "Create your account", done: true },
  { id: 2, title: "Verify your email", done: true },
  { id: 3, title: "Fill out your profile", done: true },
  { id: 4, title: "Pick your primary track", done: true },
  { id: 5, title: "Join the cohort Slack", done: true },
  { id: 6, title: "Add ONJI to your LinkedIn", done: true },
  { id: 7, title: "Watch the portal overview video", done: true },
  { id: 8, title: "Read the handbook", done: true },
  { id: 9, title: "Sign the code of conduct", done: true },
  { id: 10, title: "Submit intro assignment", done: true },
  { id: 11, title: "Install the ONJI CLI", done: true },
  { id: 12, title: "Set your working hours", done: true },
  { id: 13, title: "Pair with an onboarding buddy", done: true },
  { id: 14, title: "Attend kickoff event (recording OK)", done: true },
  { id: 15, title: "Mark onboarding complete", done: true },
];

export default function OnboardingPage() {
  const done = items.filter((i) => i.done).length;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Onboarding"
        title="Your onboarding checklist"
        description="15 steps to get you set up. Keep working through tracks even while finishing these."
        action={<Chip tone="brand">{done}/15 complete</Chip>}
      />
      <Card>
        <ol className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <CheckCircle2
                className={`h-5 w-5 shrink-0 ${
                  item.done ? "text-brand" : "text-ink-mute/40"
                }`}
              />
              <span
                className={`flex-1 text-sm ${
                  item.done ? "text-ink" : "text-ink-mute"
                }`}
              >
                {item.title}
              </span>
              {item.done ? (
                <Chip tone="brand">Done</Chip>
              ) : (
                <Button size="sm" variant="secondary">
                  Mark done
                </Button>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
