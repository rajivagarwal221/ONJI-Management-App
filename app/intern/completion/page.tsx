import { Button, Card, Chip, PageHeader } from "@/components/ui";

const requirements = [
  {
    track: "AI Fluency",
    assignments: { done: 0, total: 5 },
    capstone: "Not submitted",
    certificate: "Locked",
  },
  {
    track: "Machine Learning",
    assignments: { done: 0, total: 5 },
    capstone: "Not submitted",
    certificate: "Locked",
    primary: true,
  },
];

export default function CompletionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Completion"
        title="Certificate requirements"
        description="Each track certificate requires five accepted assignments plus an accepted capstone in that same track."
        action={<Chip tone="brand">0/2 qualified</Chip>}
      />

      <Card>
        <div className="grid gap-2">
          {requirements.map((r) => (
            <div
              key={r.track}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-soft px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-ink">{r.track}</span>
                {r.primary && <Chip tone="brand">Primary</Chip>}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-ink-mute">
                  {r.assignments.done}/{r.assignments.total} assignments
                </span>
                <span className="text-ink-mute">· capstone {r.capstone.toLowerCase()}</span>
                <Chip>{r.certificate}</Chip>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-mute">
          Required onboarding: 15/15 complete. It stays part of the internship but does not
          block certificate eligibility.
        </p>
      </Card>

      <Card>
        <h2 className="eyebrow">How verification works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-mute">
          <li>
            Every accepted assignment is recorded on your profile with a reviewer and
            timestamp.
          </li>
          <li>
            When you qualify in a track, a certificate is issued with a public verify URL that
            recruiters can check.
          </li>
          <li>
            The certificate shows your name, track, cohort, and the capstone artifact — nothing
            else.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button href="/verify" variant="secondary">
            View a sample certificate
          </Button>
        </div>
      </Card>
    </div>
  );
}
