import { Button, Card, Chip, PageHeader } from "@/components/ui";

const fields = [
  { label: "Full name", value: "Rajiv Agarwal" },
  { label: "Email", value: "arajiv221@gmail.com" },
  { label: "Country", value: "India" },
  { label: "Timezone", value: "Asia/Kolkata (UTC+5:30)" },
  { label: "LinkedIn", value: "linkedin.com/in/rajiv-agarwal" },
  { label: "GitHub", value: "github.com/rajivagarwal221" },
  { label: "Primary track", value: "Machine Learning" },
  { label: "Cohort", value: "July 2026" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Your intern profile"
        description="Shown to mentors and used on your public certificate when you qualify."
        action={<Button href="/intern/profile/edit">Edit profile</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="eyebrow">Identity</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs uppercase tracking-wide text-ink-mute">{f.label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="eyebrow">Completion</h2>
              <Chip tone="brand">100%</Chip>
            </div>
            <p className="mt-3 text-sm text-ink-mute">
              Your profile is complete and visible to mentors.
            </p>
          </Card>
          <Card>
            <h2 className="eyebrow">Visibility</h2>
            <p className="mt-3 text-sm text-ink-mute">
              Public profile is enabled. Verifiers will see your name, track, and cohort when
              they look up your certificate.
            </p>
            <Button variant="secondary" href="/intern/profile/visibility" className="mt-4">
              Manage visibility
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
