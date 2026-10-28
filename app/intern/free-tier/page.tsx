import { Button, Card, Chip, PageHeader } from "@/components/ui";

const perks = [
  {
    name: "Anthropic Claude API",
    credit: "$25 one-time credit",
    detail: "Enough to work through the AI Fluency track end-to-end.",
  },
  {
    name: "GitHub Student Pack",
    credit: "Free",
    detail: "Access GitHub Pro, Copilot, Codespaces hours, and 100+ partner perks.",
  },
  {
    name: "Google Cloud credits",
    credit: "$300 trial credits",
    detail: "Used by the Machine Learning track for Vertex AI workloads.",
  },
  {
    name: "Hugging Face Pro",
    credit: "1 month free",
    detail: "Private spaces, Inference endpoints, and dataset storage.",
  },
];

export default function FreeTierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Free Tier"
        title="Credits and tools for interns"
        description="Partner offers available to active ONJI interns. Links are personal — don't share them."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {perks.map((p) => (
          <Card key={p.name}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
              <Chip tone="brand">{p.credit}</Chip>
            </div>
            <p className="mt-2 text-sm text-ink-mute">{p.detail}</p>
            <Button variant="secondary" className="mt-4">
              Claim offer
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
