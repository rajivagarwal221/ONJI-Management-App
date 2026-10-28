import { Card, PageHeader } from "@/components/ui";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Tell us what to fix"
        description="Everything you send here goes to the ONJI team. We read every one."
      />
      <Card>
        <form className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              Category
            </span>
            <select className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
              <option>Bug</option>
              <option>Feature request</option>
              <option>Program feedback</option>
              <option>Other</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
              What happened?
            </span>
            <textarea
              rows={6}
              placeholder="A short description helps us act on it. Include links or screenshots if useful."
              className="rounded-xl border border-line bg-white p-3 text-sm"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="h-9 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover active:bg-brand-press"
            >
              Send feedback
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
